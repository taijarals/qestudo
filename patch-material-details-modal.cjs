const fs = require('fs');
let code = fs.readFileSync('src/pages/MaterialDetails.tsx', 'utf-8');

const stateCode = `  const [loading, setLoading] = useState(true);`;
const stateReplacement = `  const [selectedConcept, setSelectedConcept] = useState<any>(null);
  const [loading, setLoading] = useState(true);`;

code = code.replace(stateCode, stateReplacement);

// We need to render the tree correctly and make them clickable.
// The existing code has a recursive render Concepts:
/*
                {concepts.filter(c => c.level === 1).map(concept => (
                  <div key={concept.id} className="border border-slate-200 rounded-xl overflow-hidden bg-white">
*/

// Let's replace the whole concepts rendering with a custom one that uses the real tree from our getConcepts endpoint.

const renderConceptsCode = `                {concepts.filter(c => c.level === 1).map(concept => (`;

const customRenderConceptsCode = `
                {concepts.map((discipline: any) => (
                  <div key={discipline.id} className="border border-slate-200 rounded-xl overflow-hidden bg-white mb-4">
                    <button className="w-full flex items-center justify-between p-4 hover:bg-slate-50 transition-colors">
                      <div className="flex items-center gap-3">
                        <BookOpen className="w-5 h-5 text-indigo-500" />
                        <span className="font-bold text-slate-900">{discipline.name}</span>
                      </div>
                      <ChevronDown className="w-5 h-5 text-slate-400" />
                    </button>
                    
                    <div className="border-t border-slate-100 p-4 bg-slate-50 space-y-4">
                      {discipline.children?.map((topic: any) => (
                        <div key={topic.id} className="space-y-2">
                          <h4 className="font-semibold text-slate-800 flex items-center gap-2">
                            <Target className="w-4 h-4 text-emerald-500" />
                            {topic.name}
                          </h4>
                          <div className="pl-6 space-y-3 border-l-2 border-slate-200 ml-2">
                            {topic.children?.map((subtopic: any) => (
                               <div key={subtopic.id}>
                                  <h5 className="font-medium text-slate-700 text-sm mb-2">{subtopic.name}</h5>
                                  <div className="flex flex-wrap gap-2 pl-2">
                                     {subtopic.children?.map((concept: any) => (
                                        <Badge 
                                           key={concept.id} 
                                           variant="outline" 
                                           className="bg-white hover:bg-indigo-50 cursor-pointer"
                                           onClick={() => setSelectedConcept(concept)}
                                        >
                                           {concept.name}
                                        </Badge>
                                     ))}
                                  </div>
                               </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
                
                {selectedConcept && (
                  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                     <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
                        <div className="p-4 border-b border-slate-100 flex justify-between items-center">
                           <h3 className="font-bold text-lg">{selectedConcept.name}</h3>
                           <button onClick={() => setSelectedConcept(null)} className="text-slate-400 hover:text-slate-600">
                             ✕
                           </button>
                        </div>
                        <div className="p-4 overflow-y-auto flex-1">
                           <p className="text-slate-700 mb-6">{selectedConcept.description}</p>
                           <h4 className="font-semibold text-slate-900 mb-3 text-sm">Fontes no Material:</h4>
                           <div className="space-y-3">
                              {selectedConcept.sources?.map((s: any, idx: number) => (
                                 <div key={idx} className="bg-slate-50 p-3 rounded-lg border border-slate-100 text-sm">
                                    <div className="font-medium text-indigo-600 mb-1">Páginas {s.pageStart} - {s.pageEnd}</div>
                                    <div className="text-slate-600 italic line-clamp-3">"... {s.materialChunk?.text} ..."</div>
                                 </div>
                              ))}
                           </div>
                        </div>
                     </div>
                  </div>
                )}
`;

// This replacement needs to be careful. I'll just write a script to replace the children of the first div after 
// `<h2 className="text-xl font-bold text-slate-900">Mapa de Conhecimento</h2>`
