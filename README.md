# Tabuada Gamificada 🚀

Um aplicativo educacional focado em ensinar matemática (tabuada) através de **micro-aprendizado**, **repetição espaçada** e **gamificação intensa**.

Criado para transformar a "obrigação de decorar" em uma jornada divertida de herói!

## 🌟 Principais Funcionalidades

- **Trilha de Progressão (Mapa)**: Sistema visual de avanço em estilo "Candy Crush". Cada tabuada (2, 3, 4...) representa uma nova fase do mundo.
- **Batalhas Épicas de Chefões**: Toda vez que o aluno termina uma tabuada, ele deve derrotar o "Guardião" correspondente. O chefão tem vida, limite de tempo (60s) e reage dinamicamente aos acertos e erros.
- **Motor de Repetição Espaçada**: Contas que a criança erra são salvas no banco de dados local. Nos dias seguintes, o algoritmo "força" essas contas erradas a aparecerem novamente com maior probabilidade até a criança provar que decorou.
- **Teste de Nivelamento Automático**: Novos usuários respondem a um questionário dinâmico. O aplicativo avalia o nível atual e pula automaticamente as fases que o aluno já domina.
- **Loja de Personagens e Economia**: O aluno ganha "Gemas" por acertos, que podem ser gastas para customizar o avatar.
- **Coleção de Conquistas**: Vitórias contra chefões liberam medalhas em uma galeria interativa.
- **Painel do Professor / Pais**: Uma interface dedicada (`painel.html`) para visualizar rapidamente quais alunos estão em ofensiva (fogo), quem está sem energia e em qual fase cada um está travado.

## 🛠 Tecnologias Utilizadas

- **Frontend**: HTML5, CSS3 (variáveis, flexbox/grid, animações) e Vanilla JavaScript.
- **Persistência**: `localStorage` (estruturado como um banco relacional no frontend, armazenando perfis, histórico de repetição espaçada, inventário e saldo).
- **Design**: Mobile-first, Dark Mode, UI/UX baseada em aplicativos de idioma (Duolingo).

## 🚀 Como Rodar o Projeto

1. Clone o repositório:
   ```bash
   git clone https://github.com/alexandrehenriqueventura/tabuada.git
   ```
2. Abra o arquivo `index.html` em qualquer navegador web.
3. Para acessar o Dashboard de Pais/Professores, abra o arquivo `painel.html`.

## 📈 Status do Projeto
Fase 1: Layout e Estrutura Inicial - Concluído ✅
Fase 2: Motor de Repetição Espaçada - Concluído ✅
Fase 3: Gamificação, Loja e Medalhas - Concluído ✅
Fase 4: Integração de Banco de Dados Real e Painel Dinâmico - Em andamento 🚧
