Outline after call with Harry
-----------------------------

Common forms of formal methods slop:
  *	Agents change your properties in order to meet the code
  *	Agents prove that your code meets the specification that is defined by your code, which is vacuously true
  *	The property/theorem as stated is subtly (but importantly) different than what you asked for (interpretability problem for specifications)
  *	There is little to no thought given to the link between your model and the actual implementation
  *	Bad PBT generators

Probity:
  *	Provide pathway from current software engineering practices to formal methods, helping engineers _understand the toolbox_
    -	Property-based testing
    -	Semantics
    -	Specifications
    -	Modeling 
    -	Embedding
    -	Lean
  *	Ensuring research tools are ready for SWE _and_ agent use
    -	Scaffolding for common FM tasks
    -	User studies
    -	Maintaining important-but-not-interesting-to-PhDs FM tools, e.g.:
    -	Lean WASM backend
    -	KLEE on modern LLVM
    -	Microsoft Code Contracts (rip)
    -	QuickChick for Lean — HG: Need to be careful with this should say “contribute”


https://harrisongoldste.in/aws-ai-talk-2026/
https://github.com/hgoldstein95/lean-mc
  *	(In planning) I asked: “Look through issues that old versions of Minecraft had, and design theorems that can rule out those issues”
  *	“Look for places to replace tests with theorems”
  *	It used raylib, which I was suspicious of
  *	I asked it to model the raylib API, test the model’s association with the library, and prove properties against the model
