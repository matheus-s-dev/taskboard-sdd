# Validação contra a especificação

Estado inicial: **todos os cenários pendentes**. A aplicação ainda não foi implementada.

Ao executar, preencher resultado, data e evidência; registrar falhas e repetir os cenários afetados após a correção.

| ID | Requisito | Cenário | Resultado |
| --- | --- | --- | --- |
| V01 | RF01 | Criar com título válido; conferir A fazer, prioridade média e campos salvos | Pendente |
| V02 | RF01, RF02 | Rejeitar título vazio, só espaços, acima de 100 caracteres e descrição acima de 500 | Pendente |
| V03 | RF01, RF02 | Cancelar criação e edição; conferir ausência de mudanças | Pendente |
| V04 | RF02 | Editar campos; preservar identificador, estado e criação | Pendente |
| V05 | RF03 | Mover para cada um dos três estados; conferir grupo e preservação dos campos | Pendente |
| V06 | RF04 | Cancelar e confirmar exclusão; conferir que somente a tarefa escolhida é removida | Pendente |
| V07 | RF05 | Combinar filtros, produzir resultado vazio e limpar filtros | Pendente |
| V08 | RF05 | Criar duas tarefas e editar a mais antiga; conferir ordenação por criação | Pendente |
| V09 | RF06 | Recarregar após cada operação de escrita; conferir dados e filtros reiniciados | Pendente |
| V10 | RF06 | Simular armazenamento indisponível; conferir aviso e continuidade na sessão | Pendente |
| V11 | RF06 | Simular JSON ou estrutura inválida; conferir aviso e confirmação antes de substituir dados | Pendente |
| V12 | RNF01 | Executar criar, editar, mover, filtrar e excluir usando apenas teclado | Pendente |
| V13 | RNF01 | Conferir rótulos, foco visível, erros e identificação textual de estado e prioridade | Pendente |
| V14 | RNF02 | Verificar 360 px e 1280 px, incluindo título longo e ausência de rolagem horizontal | Pendente |
| V15 | RF01, RF02 | Salvar prazo passado e prazo futuro; conferir a mesma data após edição e recarga | Pendente |

## Verificações técnicas

| Verificação | Resultado |
| --- | --- |
| Build de produção | Pendente |
| Lint | Pendente |
| Testes automatizados de regras e armazenamento | Pendente |

## Registro de execução

Ainda não há execuções ou evidências de funcionamento da aplicação.
