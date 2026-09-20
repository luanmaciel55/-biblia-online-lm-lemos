# Bíblia On-line — Projeto L.M. Lemos

Aplicação bíblica responsiva em Next.js, preparada para publicação na Vercel.

## Conteúdo

- **Bíblia:** Almeida 1819 — Bíblia Livre, em domínio público; 66 livros, 1.189 capítulos e 31.102 versículos.
- **Dicionário:** *Dicionário Teológico — Amplo Conhecimento, Projeto L.M. Lemos*, de Luan Maciel de Lemos; 260 verbetes.
- Busca bíblica e busca própria do dicionário.
- Assuntos e estudos bíblicos, introdução de cada livro, destaques, notas e criação de imagem de versículo.
- Estudo profundo com termos representativos do hebraico e grego, pronúncia, tradução e contexto.
- Temas padrão, marrom, vermelho e preto; layout otimizado para celular.

As marcações, notas e preferências de tema são guardadas no navegador do usuário.

## Executar

```bash
pnpm install
pnpm dev
```

## Verificar e gerar produção

```bash
pnpm exec tsc --noEmit
pnpm build
```

O arquivo `vercel.json` e a exportação estática em `next.config.ts` já estão configurados para a Vercel.
