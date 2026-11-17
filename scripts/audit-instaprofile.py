#!/usr/bin/env python3
"""Auditoria automatizada de compatibilidade visual do InstaProfile.

Exercita a mesma estrutura DOM e nomes de classes dos Blade do LinkStack
(Default Theme): avatar, cabeçalho, biografia, ícones, botões, blocos
personalizados, compartilhamento e footer aninhado.
NÃO atesta fluxos de autenticação/banco nem conteúdo remoto de terceiros.
"""
from __future__ import annotations

from pathlib import Path
from playwright.sync_api import sync_playwright
import tinycss2

ROOT = Path(__file__).resolve().parent.parent
THEME = ROOT / "reference-themes" / "InstaProfile"
QA = ROOT / ".theme-build" / "qa"
QA.mkdir(parents=True, exist_ok=True)
FILES = ["skeleton-auto.css", "brands.css", "share.button.css", "animations.css"]
SIZES = [(320, 720), (360, 780), (390, 844), (430, 932), (768, 1024), (1024, 768), (1440, 900)]

def css_errors(css: str, name: str):
    for item in tinycss2.parse_stylesheet(css, skip_whitespace=True, skip_comments=True):
        assert item.type != "error", f"CSS inválido em {name}: {item}"
        if item.type == "at-rule" and item.content is not None:
            nested = tinycss2.parse_rule_list(item.content, skip_whitespace=True, skip_comments=True)
            for node in nested:
                assert node.type != "error", f"CSS inválido em @{item.at_keyword}, {name}: {node}"

def file_checks():
    required = [
        "config.php", "readme.md", "skeleton-auto.css", "brands.css",
        "share.button.css", "animations.css"
    ]
    for name in required:
        assert (THEME / name).is_file(), f"Arquivo ausente: {name}"
    assert not (THEME / "extra" / "custom-assets" / "particles.min.js").exists()
    css = "\n".join((THEME / name).read_text("utf-8") for name in FILES)
    for name in FILES:
        css_errors((THEME / name).read_text("utf-8"), name)
    assert "@keyframes" not in css.lower()
    assert "@import" not in css.lower()
    for selector in ("iframe", "video", "audio", "table", "pre", "textarea", "fieldset",
                     ".container .container", ".social-icon-div", ".button-entrance",
                     ".sharediv", "prefers-reduced-motion", "focus-visible", "max-width"):
        assert selector in css, f"Estilo de compatibilidade ausente: {selector}"
    config = (THEME / "config.php").read_text("utf-8")
    assert "'allow_custom_buttons' => 'true'" in config
    assert "'enable_custom_code' => 'false'" in config
    print("OK: estrutura, CSS sintaticamente válido, compatibilidade e ausência de animações")

def html():
    image = "data:image/svg+xml,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%20viewBox='0%200%201200%20800'%3E%3Crect%20width='1200'%20height='800'%20fill='%23d62976'/%3E%3C/svg%3E"
    long_text = "LINKSTACKCOMPATIBILIDADESEMPERDERAEXIBICAO" * 4
    return f"""<!doctype html><html lang="pt-BR"><head>
    <meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
    <title>InstaProfile — Teste de paridade do Default</title>
    </head><body>
    <div class="sharediv"><div><button type="button" class="sharebutton share-button" aria-label="Compartilhar" id="share">↑</button></div></div>
    <div class="container"><div class="row"><div class="column" style="margin-top:5%">
      <img id="avatar" class="rounded-avatar fadein" src="{image}" alt="Avatar" width="128" height="128">
      <h1 class="fadein dynamic-contrast">Página de testes {long_text[:20]}</h1>
      <div class="fadein description-parent dynamic-contrast"><p>Biografia acessível e responsiva: {long_text}</p></div>
      <div class="row fadein social-icon-div">
         <a class="social-hover social-link" href="#social" aria-label="Rede social">◎</a>
         <a class="social-hover social-link" href="#social2" aria-label="Vídeos">▶</a>
      </div>
      <div class="button-entrance"><a id="link1" class="button button-default button-click button-hover icon-hover" href="#target"><img class="icon hvr-icon" alt="" src="{image}">Link padrão</a></div>
      <div class="button-entrance"><a id="link2" class="button button-custom_website button-click button-hover icon-hover" href="#target">Botão personalizado</a></div>
      <div class="button-spacer" style="height:45px"></div>
      <div class="fadein"><h2>Título de bloco personalizado</h2></div>
      <div class="fadein"><span>Texto personalizado, <strong>negrito</strong>, <em>itálico</em> e <a href="#texto">link acessível</a>.</span></div>
      <div class="rich-media"><figure><img id="media-image" src="{image}" width="1200" height="800" alt="Imagem do usuário"><figcaption>Legenda de imagem responsiva</figcaption></figure></div>
      <video controls preload="none" width="1280" height="720" aria-label="Vídeo incorporado"></video>
      <audio controls aria-label="Áudio incorporado"></audio>
      <iframe title="Vídeo externo" src="https://www.youtube-nocookie.com/embed/TESTE" width="1280" height="720" loading="lazy"></iframe>
      <iframe title="Embed genérico" srcdoc="<p>Conteúdo de um iframe</p>" width="1280" height="240"></iframe>
      <blockquote>Depoimento do usuário sem animação</blockquote>
      <div class="content-table"><table id="table"><thead><tr><th>Nome</th><th>Descrição muito longa para testar tabela responsiva</th><th>Contatos</th><th>Referência</th></tr></thead><tbody><tr><td>Perfil</td><td>{long_text}</td><td>hello@example.org</td><td>2026</td></tr></tbody></table></div>
      <pre id="code"><code>{long_text}</code></pre>
      <form id="sample-form"><fieldset><legend>Formulário do bloco</legend>
        <label for="email">E-mail</label><input type="email" id="email" name="email" placeholder="contato@example.org" required>
        <label for="message">Mensagem</label><textarea id="message" name="message"></textarea>
        <label for="select">Opção</label><select id="select"><option>Selecione</option></select>
        <button id="submit" type="submit">Enviar</button></fieldset>
      </form>
      <div class="container" id="nested-footer"><div class="footer fadein"><a href="#home" class="footer-hover spacing">Início</a><a href="#privacy" class="footer-hover spacing">Privacidade</a></div>
      <div class="credit-hover"><img src="{image}" alt="Créditos" width="200" height="50"></div></div>
    </div></div></div>
    <script>
      window.__clicks = {{link:0, share:0, form:0}};
      document.getElementById('link1').addEventListener('click', e => {{e.preventDefault(); window.__clicks.link++;}});
      document.getElementById('share').addEventListener('click', e => {{window.__clicks.share++;}});
      document.getElementById('sample-form').addEventListener('submit', e => {{e.preventDefault(); window.__clicks.form++;}});
    </script>
    </body></html>"""

def test_browser():
    with sync_playwright() as playwright:
        # Runner Ubuntu possui Google Chrome; sem download de browser no CI.
        browser = playwright.chromium.launch(channel="chrome", headless=True,
                                            args=["--no-sandbox", "--disable-dev-shm-usage"])
        try:
            for width, height in SIZES:
                context = browser.new_context(viewport={"width":width,"height":height},
                                              device_scale_factor=1)
                context.route("**/*", lambda route: route.abort())
                page = context.new_page()
                page.set_content(html())
                # Simula regras de entrada que o Default injeta antes do CSS do tema.
                page.add_style_tag(content=".fadein{animation:fade 3s infinite}.social-hover:hover{transform:scale(1.1)}.footer-hover:hover{transform:translateY(-8px)}")
                for name in ["share.button.css", "brands.css", "skeleton-auto.css", "animations.css"]:
                    page.add_style_tag(content=(THEME / name).read_text("utf-8"))
                page.locator("body").wait_for()

                m = page.evaluate("""() => {
                  const get=id=>document.getElementById(id), box=id=>get(id).getBoundingClientRect();
                  const con=document.querySelector('body > .container').getBoundingClientRect();
                  const v=document.querySelector('video').getBoundingClientRect();
                  const youtube=document.querySelector('iframe[title="Vídeo externo"]').getBoundingClientRect();
                  const generic=document.querySelector('iframe[title="Embed genérico"]').getBoundingClientRect();
                  const share=box('share');
                  const img=box('media-image');
                  const btn=box('link1');
                  const footer=get('nested-footer');
                  const table=get('table');
                  return {
                    viewport:innerWidth, scrollWidth:document.documentElement.scrollWidth,
                    bodyScrollWidth:document.body.scrollWidth,
                    container:con.width, containerRight:con.right,
                    image:img.width, video:v.width, youtube:youtube.width, generic:generic.width,
                    share:share.width, shareRight:share.right,
                    buttonWidth:btn.width, buttonHeight:btn.height,
                    buttonRight:btn.right,
                    tableWidth:table.getBoundingClientRect().width,
                    tableClientWidth:table.clientWidth, tableScrollWidth:table.scrollWidth,
                    nestedBackground:getComputedStyle(footer).backgroundColor,
                    nestedBorder:getComputedStyle(footer).borderTopWidth,
                    nestedBefore:getComputedStyle(footer, '::before').display,
                    avatarRadius:getComputedStyle(get('avatar')).borderTopLeftRadius,
                    animation:getComputedStyle(document.querySelector('.fadein')).animationName,
                    socialTransform:getComputedStyle(document.querySelector('.social-hover')).transform,
                    inputWidth:box('email').width,
                    focusSelector:getComputedStyle(get('email')).outlineStyle
                  };
                }""")

                assert m["scrollWidth"] <= width + 1, f"Overflow raiz {width}: {m}"
                assert m["bodyScrollWidth"] <= width + 1, f"Overflow body {width}: {m}"
                assert m["containerRight"] <= width + 1, f"Cartão fora da tela {width}: {m}"
                assert m["image"] <= m["container"], f"Imagem maior que cartão {width}: {m}"
                assert m["video"] <= m["container"], f"Vídeo maior que cartão {width}: {m}"
                assert m["youtube"] <= m["container"], f"Youtube maior que cartão {width}: {m}"
                assert m["generic"] <= m["container"], f"Iframe maior que cartão {width}: {m}"
                assert m["shareRight"] <= width + 1, f"Share fora da tela {width}: {m}"
                assert m["buttonHeight"] >= 44, f"Área de toque insuficiente {width}: {m}"
                assert m["buttonRight"] <= width + 1, f"Botão fora da tela {width}: {m}"
                assert m["nestedBackground"] in ("rgba(0, 0, 0, 0)", "transparent"), f"Footer duplicado {width}: {m}"
                assert m["nestedBorder"] == "0px", f"Borda footer duplicada {width}: {m}"
                assert m["nestedBefore"] == "none", f"Barra duplicada no footer {width}: {m}"
                assert m["animation"] == "none", f"Animação herdada {width}: {m}"
                assert m["inputWidth"] <= m["container"], f"Formulário fora do card {width}: {m}"

                if width <= 430:
                    assert m["tableScrollWidth"] >= m["tableClientWidth"], f"Tabela precisa ser rolável: {m}"
                page.locator("#link1").click()
                page.locator("#share").click()
                page.locator("#email").fill("teste@example.org")
                page.locator("#submit").click()
                actions = page.evaluate("window.__clicks")
                assert actions == {"link":1,"share":1,"form":1}, f"Interações quebradas: {actions}"
                if width in (320,390,768,1440):
                    page.screenshot(path=str(QA / f"instaprofile-{width}px.png"),
                                    full_page=True, animations="disabled")
                print(f"OK viewport {width}px: sem overflow, mídia responsiva, botões/compartilhamento/formulário operacionais")
                context.close()
        finally:
            browser.close()

if __name__ == "__main__":
    file_checks()
    test_browser()
    print("AUDITORIA VISUAL AUTOMATIZADA APROVADA")
