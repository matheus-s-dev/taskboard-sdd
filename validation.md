# Validação contra a especificação

Estado em 08/10/2026: interface, filtros e criação em memória implementados. Resultados parciais não representam a aprovação de requisitos ainda incompletos.

Ao executar, preencher resultado, data e evidência; registrar falhas e repetir os cenários afetados após a correção.

| ID | Requisito | Cenário | Resultado |
| --- | --- | --- | --- |
| V01 | RF01 | Criar com título válido; conferir A fazer, prioridade média e campos salvos | Aprovado em memória em 08/10; persistência em V09 |
| V02 | RF01, RF02 | Rejeitar título vazio, só espaços, acima de 100 caracteres e descrição acima de 500 | Parcial: só espaços rejeitado com mensagem; título longo criado; demais limites e edição pendentes |
| V03 | RF01, RF02 | Cancelar criação e edição; conferir ausência de mudanças | Parcial: Escape fecha criação sem adicionar tarefa; edição pendente |
| V04 | RF02 | Editar campos; preservar identificador, estado e criação | Pendente |
| V05 | RF03 | Mover para cada um dos três estados; conferir grupo e preservação dos campos | Pendente |
| V06 | RF04 | Cancelar e confirmar exclusão; conferir que somente a tarefa escolhida é removida | Pendente |
| V07 | RF05 | Combinar filtros, produzir resultado vazio e limpar filtros | Aprovado em 08/10: Concluído + Alta retorna vazio; limpar restaura os 4 exemplos |
| V08 | RF05 | Criar duas tarefas e editar a mais antiga; conferir ordenação por criação | Pendente |
| V09 | RF06 | Recarregar após cada operação de escrita; conferir dados e filtros reiniciados | Pendente |
| V10 | RF06 | Simular armazenamento indisponível; conferir aviso e continuidade na sessão | Pendente |
| V11 | RF06 | Simular JSON ou estrutura inválida; conferir aviso e confirmação antes de substituir dados | Pendente |
| V12 | RNF01 | Executar criar, editar, mover, filtrar e excluir usando apenas teclado | Pendente |
| V13 | RNF01 | Conferir rótulos, foco visível, erros e identificação textual de estado e prioridade | Parcial: criação e filtros conferidos; foco inicial e retorno por Escape aprovados; fluxos restantes pendentes |
| V14 | RNF02 | Verificar 360 px e 1280 px, incluindo título longo e ausência de rolagem horizontal | Aprovado em 08/10 para a interface atual; reconferir após acrescentar as demais ações |
| V15 | RF01, RF02 | Salvar prazo passado e prazo futuro; conferir a mesma data após edição e recarga | Parcial: criação com prazo 01/10/2026 e prioridade Alta conferida; edição e persistência pendentes |

## Verificações técnicas

| Verificação | Resultado |
| --- | --- |
| Build de produção | Aprovado em 08/10: npm run build, com checagem TypeScript incluída |
| Lint | Ainda não configurado; avaliar na etapa final |
| Testes automatizados de regras e armazenamento | Pendente |

## Registro de execução

Revisão manual no Chrome em 08/10/2026, usando a prévia local do Vite. Conferidos filtros combinados, resultado vazio, limpeza, criação com título longo, rejeição de título só com espaços, prazo passado, prioridade, fechamento por Escape e retorno do foco.

Layout conferido nas larguras solicitadas de 360 e 1280 px. A largura do documento foi igual à largura visível em ambas, sem rolagem horizontal. Captura desktop: `preview-desktop.jpg`.

Build e TypeScript aprovados. Testes automatizados, edição, exclusão, mudança de estado e persistência continuam pendentes.
