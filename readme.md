# 💼 Currículum Vitae

<p align="center">
  <a href="https://jimmykiedis.github.io/Curriculum-Vitae/">
    <img src="https://img.shields.io/badge/💻%20Live%20Demo-E34F26?style=for-the-badge" alt="Live Demo">
  </a>

  <br>

<em>🚀 Click the button to access the live demo.</em>

</p>

<p align="center">

  <img src="https://img.shields.io/badge/HTML5-E34F26?style=flat&logo=html5&logoColor=white" alt="HTML5">
  <img src="https://img.shields.io/badge/CSS3-1572B6?style=flat&logo=css3&logoColor=white" alt="CSS3">
  <img src="https://img.shields.io/badge/JavaScript-F7DF1E?style=flat&logo=javascript&logoColor=black" alt="JavaScript">
  <img src="https://img.shields.io/badge/GitHub%20Pages-222222?style=flat&logo=github&logoColor=white" alt="GitHub Pages">
  <img src="https://img.shields.io/badge/Status-Online-success?style=flat" alt="Status online">

</p>

Este repositório é um site simples para criar e editar currículo diretamente no navegador. 🖥️ Ele ajuda uma pessoa a preencher seus dados, escolher um modelo e gerar um currículo pronto para impressão ou PDF, sem precisar instalar nada pesado.

## 🎯 Objetivos

* 📄 Criar um currículo profissional de forma fácil e rápida.
* ✍️ Permitir que a pessoa preencha seus dados sem precisar escrever o currículo do zero.
* 🎨 Oferecer modelos prontos para diferentes perfis.
* 👀 Mostrar uma pré-visualização em tempo real enquanto o usuário altera as informações.
* 🖨️ Deixar o documento pronto para imprimir ou salvar em PDF.
* 💾 Guardar os dados no navegador para que a pessoa continue trabalhando depois.

## ✨ Features

* 📝 Formulário com dados pessoais, formação, experiências, qualificações, conhecimentos e habilidades.
* 🎨 Escolha de modelos de currículo.
* 👀 Pré-visualização ao vivo do documento.
* 💡 Sugestões de texto padrão para objetivo e habilidades.
* 💾 Armazenamento local no navegador com `localStorage`.
* 🖨️ Botão para imprimir e salvar em PDF.
* 📱 Layout limpo e responsivo, pensado para uso em desktop e mobile.

## 🚀 Como utilizar o repositório

### 📥 1. Clone o Repositório

Clone o repositório e navegue até a pasta do projeto:


```bash
git clone https://github.com/jimmykiedis/Curriculum-Vitae.git

cd Curriculum-Vitae
```

### 3. ▶️ Rode o projeto

Como o site usa JavaScript moderno em módulo, o melhor é abrir em um servidor local. No terminal, execute:

```bash
python -m http.server 8000
```

Depois abra no navegador:

```text
http://localhost:8000
```

### 4. ✍️ Preencha as informações

* 👤 Informe nome, contato, cidade, e-mail e dados pessoais.
* 🎓 Adicione formação, experiências e cursos.
* 🎨 Escolha um modelo de currículo.
* 🎯 Ajuste o objetivo e as habilidades.

### 5. 🖨️ Salve ou imprima

* Clique em **"Imprimir / Salvar PDF"**.
* Na janela de impressão, escolha **"Salvar como PDF"**.

## 🏗️ Estratégia de implementação

A implementação foi pensada como um projeto estático de front-end:

* 🌐 `index.html`: estrutura da página e elementos do editor e da pré-visualização.
* 🎨 `css/style.css`: visual, layout, responsividade e aparência do currículo.
* 🧩 `js/templates.js`: contém os modelos de currículo e textos padrão.
* ⚙️ `js/app.js`: monta o formulário, atualiza o preview, salva os dados, aplica os templates e controla a impressão.
* 🚀 `.github/workflows/publicar-pages.yml`: publica o site no GitHub Pages automaticamente.

Em outras palavras, o projeto não usa banco de dados nem backend. ☁️ Tudo fica no navegador e o usuário trabalha localmente no site.

## 🛠️ Tecnologias usadas

* 🌐 HTML5
* 🎨 CSS3
* ⚡ JavaScript
* 📄 GitHub Pages
* 🤖 GitHub Actions

Essas mesmas tecnologias aparecem nos badges do projeto e no fluxo de publicação.

## 📁 Estrutura do repositório

```text
Curriculum-Vitae/

├── .github/
│   └── workflows/
│       └── publicar-pages.yml
│
├── css/
│   └── style.css
│
├── js/
│   ├── app.js
│   └── templates.js
│
├── .gitignore
│
├── index.html
│
└── readme.md
```

## 🧠 Resumo simples

Este repositório serve para quem quer montar um currículo profissional de maneira fácil, bonita e rápida. 💼✨

Ele é útil para pessoas que não têm muito conhecimento técnico, porque o sistema mostra tudo em tela e ajuda na criação do documento final.

Basta preencher os campos, escolher um modelo e gerar o currículo pronto para entregar a uma empresa. 🚀📄

## 📜 Licença

Este projeto foi criado para uso pessoal, estudo e prática. 🎓

Você pode usar e adaptar o código conforme sua necessidade, desde que o uso seja responsável e respeite o objetivo educativo do projeto.
