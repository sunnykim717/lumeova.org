const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const [runtimeDir,oldUiFile,outDir]=process.argv.slice(2);
if(!runtimeDir||!oldUiFile||!outDir)throw Error('Usage: node scripts/prepare-membership-hotfix.cjs runtime-dir current-served-ui.js output-dir');
const oldUi=fs.readFileSync(oldUiFile,'utf8');
const marker='\n\n(()=>{\n const states=new WeakMap()';
const cut=oldUi.indexOf(marker);if(cut<0)throw Error('Unrecognized production email UI; review before patching.');
const newUi=oldUi.slice(0,cut)+'\n\n'+fs.readFileSync(path.join(__dirname,'../cloudflare/membership-email-ui.js'),'utf8');
new vm.Script(newUi);
const oldRuntime=fs.readFileSync(path.join(runtimeDir,'membership-worker.js'),'utf8');
const oldLiteral=JSON.stringify(oldUi);
if(oldRuntime.split(oldLiteral).length!==2)throw Error('Production bundle differs from the downloaded UI.');
let runtime=oldRuntime.replace(oldLiteral,()=>JSON.stringify(newUi));
const oldPath='/_lumeova-membership/20261027-v15.js',newPath='/_lumeova-membership/20261108-v16.js';
if(!runtime.includes('var dv='+JSON.stringify(oldPath)))throw Error('Unexpected production script URL.');
runtime=runtime.replace('var dv='+JSON.stringify(oldPath),'var dv='+JSON.stringify(newPath));
fs.mkdirSync(outDir,{recursive:true});
for(const name of fs.readdirSync(runtimeDir)){if(!name.endsWith('.js'))throw Error('Unexpected runtime module');fs.copyFileSync(path.join(runtimeDir,name),path.join(outDir,name));}
fs.writeFileSync(path.join(outDir,'membership-worker.js'),runtime);
fs.writeFileSync(path.join(outDir,'served-ui.js'),newUi);
console.log(JSON.stringify({changed:['membership-worker.js'],uiPath:newPath,moduleCount:fs.readdirSync(runtimeDir).length}));

