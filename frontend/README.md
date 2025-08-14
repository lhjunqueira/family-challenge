<h1 align="center">Frontend - Family Challenge</h1>

Aplicação Angular 17 para cadastro, listagem, detalhamento e manutenção de pessoas em uma estrutura familiar simples. Usa Component Store local para cada container, interceptores para cross-cutting concerns e pipe customizado para formatação de CPF.

## ✅ Objetivos Atendidos

- CRUD de família (pessoa)
- Listagem paginada com filtro textual (nome / documento)
- Visualização de detalhes em modal ou bottom sheet (mobile)
- Formatação e ocultação parcial de CPF
- Recarregamento automático após criação / exclusão
- Tratamento centralizado de erros HTTP

## 🧱 Estrutura de Pastas (resumo)

```
src/
	main.ts
	app/
		core/
			interceptors/        (ApiInterceptor, ErrorInterceptor)
		features/
			modules/
				families/
					components/
						list-families-container/  (container + store local)
						modal-create-update-family/
						modal-family-details/     (component + store)
					service/        (FamiliesService)
					dto/            (CreateUpdate + Filter)
					models/         (FamilyModel)
		shared/
			pipes/              (CpfPipe)
			models/             (ListPaginated)
			stores/             (extensões futuras)
```

## 🧠 Design Patterns / Técnicas

1. Component Store: isola estado e efeitos por contexto UI (`FamiliesStore`, `ModalFamilyDetailsStore`).
2. HTTP Interceptor: prefixo de URL e padronização de erros (`ApiInterceptor`, `ErrorInterceptor`).
3. Service Layer: abstração de chamadas REST (`FamiliesService`).
4. DTO Contracts: interfaces claras de fronteira (`CreateUpdateFamilyDto`, `FilterFamiliesPaginatedDto`).
5. Presentation Container: `ListFamiliesContainerComponent` orquestra filtros/paginação; modais tratam edição/detalhes.

## 🏗️ Decisões de Arquitetura

- Componentes standalone reduzem dependência de NgModules e facilitam composição.
- ComponentStore preferido a Store global para evitar boilerplate prematuro.
- Interceptores concentram cross-cutting (URL base + formatação de erro) para minimizar repetição.
- Reset de página para 0 após criação garante que novo item apareça imediatamente.
- Pipe de CPF evita dependências externas grandes para simples formatação/ocultação.
- Suite de testes foca em pontos críticos (transformações, efeitos, interceptores). Uma suite de container está temporariamente desativada (documentado) até ajuste de injeção.

## ▶️ Execução

### Pré-requisitos

Node 18+ e pnpm (ou usar Docker).

### Local

```bash
pnpm install
pnpm start
# http://localhost:4200
```

### Docker

```bash
docker-compose up --build
# ou
docker-compose up
# http://localhost:4200
```

### Testes

```bash
pnpm test        # headless
pnpm run test:ci # headless + coverage
```

Executados em Chrome headless via Puppeteer (variável CHROME_BIN configurada no script).

## 📡 Endpoints Consumidos

Assumidos pela camada de serviço (prefixo pode ser ajustado por interceptor):

| Método | Path          | Descrição               | Body                  | Principais Respostas |
| ------ | ------------- | ----------------------- | --------------------- | -------------------- |
| GET    | /families     | Lista paginada + filtro | -                     | 200                  |
| GET    | /families/:id | Detalhe de família      | -                     | 200, 404             |
| POST   | /families     | Cria família            | CreateUpdateFamilyDto | 201, 400             |
| PUT    | /families/:id | Atualiza família        | CreateUpdateFamilyDto | 200, 400, 404        |
| DELETE | /families/:id | Remove família          | -                     | 200, 404             |

Exemplo (lista paginada):

```json
{
  "items": [{ "id": "1", "name": "Alice", "birthDate": "1990-01-01", "document": "12345678901" }],
  "total": 1
}
```

## 🛡️ Validações Visíveis no Front

- Nome obrigatório (controle de formulário).
- `birthDate` deve ser data válida (UI / input date).
- CPF formatado/mascarado (`CpfPipe`): limita a 11 dígitos, opção de ocultar ou retornar apenas dígitos.
- Relações (`fatherId`, `motherId`) opcionais; detalhes carregados sob demanda.
- Busca textual livre, debounce aplicado antes do carregamento.

## 🔍 Paginação & Busca

- Parâmetros: `page`, `limit`, `search`.
- Efeito `setPage$` atualiza filtro e dispara `loadFamilies$`.
- Após criação: filtro ajustado para `page = 0` e recarrega lista.
- Debounce de 500ms + `distinctUntilChanged` para reduzir requisições repetidas.

## 🧪 Testes

Abrangência atual (20 specs ativas):

- Pipe: `CpfPipe` (formatar, truncar, ocultar, unmask)
- Interceptores: prefixo e tratamento de erro
- Serviço: métodos CRUD + query params
- Stores: carregamento, criação, atualização, deleção, fetch de detalhes, estados de erro
- Componentes: modal de detalhes

Suite de container `ListFamiliesContainerComponent` desativada via `xdescribe` (pendente: mock consistente de `FamiliesStore`).

## 🚀 Futuras Evoluções

- Reativar testes do container principal.
- Testes de UI (Cypress/Playwright) para fluxos completos.
- i18n e acessibilidade (labels ARIA, navegação por teclado).
- Validação de CPF com checksum.
- Estratégia de notificação de erro (snackbar/toast) integrada ao interceptor.
- Cache / memoização de páginas frequentes.

## 📄 Licença

MIT – uso livre para avaliação técnica.

---

Qualquer dúvida sobre decisões ou trade-offs: ver seções de Design Patterns e Decisões ou abrir issue.
