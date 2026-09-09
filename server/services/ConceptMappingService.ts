import { GoogleGenAI, Type, Schema } from '@google/genai';
import { prisma } from '../database/prisma';
import { conceptMappingPrompt, CONCEPT_MAPPING_PROMPT_VERSION } from '../ai/prompts/conceptMappingPrompt';

export class ConceptMappingService {
  private ai: GoogleGenAI;
  
  constructor() {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY não configurada no servidor.');
    }
    this.ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }

  async mapConcepts(materialId: string) {
    console.log(`[mapping_started] Material: ${materialId}`);
    
    // Check material status
    const material = await prisma.material.findUnique({
      where: { id: materialId },
      include: { chunks: { orderBy: { order: 'asc' } } }
    });

    if (!material) throw new Error('Material not found');
    if (material.status !== 'ready_for_mapping') {
      throw new Error('Material is not ready for mapping');
    }
    
    const chunks = material.chunks;
    if (!chunks || chunks.length === 0) {
      throw new Error('No chunks found for this material');
    }

    console.log(`[chunks_loaded] ${chunks.length} chunks loaded`);

    // Update status to mapping_concepts
    await prisma.material.update({
      where: { id: materialId },
      data: { status: 'mapping_concepts', processingProgress: 10, processingError: null }
    });

    try {
      // Chunking strategy: process all chunks at once if not too large, else batch.
      // For this implementation, we will pass them all if they fit in the context.
      // 3000 chars * 10 chunks = 30k chars, well within 1M tokens.
      const chunksText = chunks.map(c => `[Chunk ID: ${c.id} | Pages: ${c.pageStart}-${c.pageEnd}]\n${c.text}`).join('\n\n');

      const model = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
      
      const responseSchema: Schema = {
        type: Type.OBJECT,
        properties: {
          discipline: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              description: { type: Type.STRING }
            },
            required: ['name', 'description']
          },
          topics: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                description: { type: Type.STRING },
                subtopics: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      name: { type: Type.STRING },
                      description: { type: Type.STRING },
                      concepts: {
                        type: Type.ARRAY,
                        items: {
                          type: Type.OBJECT,
                          properties: {
                            name: { type: Type.STRING },
                            description: { type: Type.STRING },
                            sourceChunkIds: {
                              type: Type.ARRAY,
                              items: { type: Type.STRING }
                            },
                            pageStart: { type: Type.INTEGER },
                            pageEnd: { type: Type.INTEGER },
                            relatedConceptNames: {
                              type: Type.ARRAY,
                              items: { type: Type.STRING }
                            },
                            confusableConceptNames: {
                              type: Type.ARRAY,
                              items: { type: Type.STRING }
                            }
                          },
                          required: ['name', 'description', 'sourceChunkIds', 'pageStart', 'pageEnd', 'relatedConceptNames', 'confusableConceptNames']
                        }
                      }
                    },
                    required: ['name', 'description', 'concepts']
                  }
                }
              },
              required: ['name', 'description', 'subtopics']
            }
          }
        },
        required: ['discipline', 'topics']
      };

      console.log(`[gemini_call] Calling ${model}`);
      await prisma.material.update({
        where: { id: materialId },
        data: { processingProgress: 30 }
      });

      const response = await this.ai.models.generateContent({
        model: model,
        contents: `${conceptMappingPrompt}\n\nMATERIAL CHUNKS:\n${chunksText}`,
        config: {
          temperature: 0.1,
          responseMimeType: 'application/json',
          responseSchema: responseSchema
        }
      });

      const resultText = response.text;
      if (!resultText) {
        throw new Error('No text returned from Gemini');
      }

      const structuredOutput = JSON.parse(resultText);
      console.log('[validation_completed] JSON parsed successfully');

      await prisma.material.update({
        where: { id: materialId },
        data: { processingProgress: 70 }
      });

      // Persist Transactionally
      await prisma.$transaction(async (tx) => {
        // Clear previous concepts for this material
        await tx.concept.deleteMany({ where: { materialId } });

        // Save discipline
        const discipline = await tx.concept.create({
          data: {
            materialId,
            name: structuredOutput.discipline.name,
            description: structuredOutput.discipline.description,
            level: 'discipline'
          }
        });

        // Store concepts to resolve relations later
        const conceptMap = new Map<string, string>(); // name -> id
        const relationsToCreate: any[] = [];

        for (const topic of structuredOutput.topics) {
          const t = await tx.concept.create({
            data: {
              materialId,
              parentId: discipline.id,
              name: topic.name,
              description: topic.description,
              level: 'topic'
            }
          });

          for (const subtopic of topic.subtopics) {
            const st = await tx.concept.create({
              data: {
                materialId,
                parentId: t.id,
                name: subtopic.name,
                description: subtopic.description,
                level: 'subtopic'
              }
            });

            for (const concept of subtopic.concepts) {
              // Validate chunk IDs
              const validChunkIds = concept.sourceChunkIds.filter((id: string) => chunks.some(c => c.id === id));
              if (validChunkIds.length === 0) {
                // Skip if no valid chunks
                continue;
              }

              const c = await tx.concept.create({
                data: {
                  materialId,
                  parentId: st.id,
                  name: concept.name,
                  description: concept.description,
                  level: 'concept'
                }
              });

              conceptMap.set(concept.name.toLowerCase(), c.id);

              for (const chunkId of validChunkIds) {
                await tx.conceptSource.create({
                  data: {
                    conceptId: c.id,
                    materialChunkId: chunkId,
                    pageStart: concept.pageStart,
                    pageEnd: concept.pageEnd
                  }
                });
              }

              if (concept.relatedConceptNames && concept.relatedConceptNames.length > 0) {
                for (const rName of concept.relatedConceptNames) {
                  relationsToCreate.push({ sourceId: c.id, targetName: rName, type: 'related' });
                }
              }

              if (concept.confusableConceptNames && concept.confusableConceptNames.length > 0) {
                for (const rName of concept.confusableConceptNames) {
                  relationsToCreate.push({ sourceId: c.id, targetName: rName, type: 'confusable' });
                }
              }
            }
          }
        }

        // Create relations
        for (const rel of relationsToCreate) {
          const targetId = conceptMap.get(rel.targetName.toLowerCase());
          if (targetId && targetId !== rel.sourceId) {
             // ensure uniqueness
             const existing = await tx.conceptRelation.findFirst({
               where: { conceptId: rel.sourceId, targetId: targetId, relationType: rel.type }
             });
             if (!existing) {
               await tx.conceptRelation.create({
                 data: {
                   conceptId: rel.sourceId,
                   targetId: targetId,
                   relationType: rel.type
                 }
               });
             }
          }
        }
      });

      console.log('[concepts_persisted] Concepts persisted successfully');

      await prisma.material.update({
        where: { id: materialId },
        data: { status: 'ready', processingProgress: 100 }
      });
      console.log(`[mapping_completed] Material: ${materialId}`);

    } catch (error: any) {
      console.error('[mapping_failed]', error);
      await prisma.material.update({
        where: { id: materialId },
        data: { status: 'mapping_error', processingError: error.message || 'Unknown error during mapping' }
      });
    }
  }
}
