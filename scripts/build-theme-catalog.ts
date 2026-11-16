import fs from "node:fs/promises";
import path from "node:path";
import JSZip from "jszip";
import { generateThemePackageFiles } from "../src/core/linkstackGenerator";
import type { ThemeProject } from "../src/core/types";

const names = ["PolySleek","galaxy","CyberHorizon","ObsidianGold","HoloPrism"];
const projects: ThemeProject[] = JSON.parse(await fs.readFile("data/studio-projects.json","utf8"));
const needed = ["config.php","readme.md","preview.png","skeleton-auto.css","brands.css","animations.css","share.button.css"];
async function recursive(folder: string, root = folder): Promise<{file:string,data:Buffer}[]> {
  const a: {file:string,data:Buffer}[] = [];
  for (const ent of await fs.readdir(folder,{withFileTypes:true})) {
    const f = path.join(folder,ent.name);
    if (ent.isDirectory()) a.push(...await recursive(f,root));
    else if(ent.isFile()) a.push({file:path.relative(root,f).split(path.sep).join("/"),data:await fs.readFile(f)});
  }
  return a;
}
for (const slug of names) {
  const project = projects.find(p => p.slug === slug);
  if (!project) throw Error("Tema ausente: "+slug);
  const folder = path.join("themes",slug);
  await fs.mkdir(folder,{recursive:true});
  const zip = new JSZip(), dest = zip.folder(slug);
  if (!dest) throw Error("Falha ao criar pasta "+slug);
  const present = new Set<string>();
  if (project.sourceType === "base") {
    for (const f of await recursive(path.join("reference-themes",slug))) {
      dest.file(f.file,f.data);
      present.add(f.file);
    }
  } else {
    for (const f of generateThemePackageFiles(project)) {
      dest.file(f.path,f.content);
      present.add(f.path);
    }
    if (project.config.background.effect === "image-backdrop" || project.config.background.imagePreset !== "none") {
      const file = project.config.background.imagePreset === "aurora"
        ? "bg_aurora_nebula_1794859274083.jpg" : "bg_obsidian_architecture_1794859274188.jpg";
      dest.file("extra/custom-assets/bg-backdrop.jpg", await fs.readFile(path.join("src/assets/images",file)));
      present.add("extra/custom-assets/bg-backdrop.jpg");
    }
    dest.file("preview.png",await fs.readFile(path.join(".theme-build/previews",slug,"preview.png")));
    present.add("preview.png");
  }
  for (const filename of needed) if(!present.has(filename)) throw Error(slug+" falta "+filename);
  const zipdata = await zip.generateAsync({type:"nodebuffer",compression:"DEFLATE",compressionOptions:{level:7}});
  const check = await JSZip.loadAsync(zipdata);
  const entries = Object.keys(check.files).filter(f=>!check.files[f].dir);
  if(entries.length!==present.size || entries.some(f=>!f.startsWith(slug+"/")))throw Error("Estrutura ZIP inválida: "+slug);
  await fs.writeFile(path.join(folder,slug+".zip"),zipdata);
  const instructions = [
    "# "+project.name,"",
    "ZIP pronto para o importador do LinkFree-LinkTree (LinkStack).","",
    "1. No painel administrativo, acesse Temas e importe "+slug+".zip.",
    "2. Escolha o tema "+slug+" no seletor.",
    "3. A imagem thumbnail.png é uma pré-visualização do visual do tema.",
    "",
    "Dentro do ZIP os arquivos começam em "+slug+"/config.php, sem uma pasta themes/ extra.",
    "Origem: "+(project.sourceType==="base"?"tema original de reference-themes.":"predefinição do arquivo data/studio-projects.json."),
    "Licença informada: "+project.license+". Consulte também o readme.md incluído no pacote.",
    "Compatibilidade de estrutura verificada; teste de execução no servidor ainda recomendado.",""
  ].join("\n");
  await fs.writeFile(path.join(folder,"README.md"),instructions);
  console.log(slug+": "+entries.length+" arquivos, ZIP "+zipdata.length+" bytes");
}
