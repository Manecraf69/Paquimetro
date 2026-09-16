## Simulador de paquímetro

Abra `index.html` diretamente no navegador. Não é necessário instalar dependências ou iniciar um servidor.

- Arraste a parte móvel com o mouse ou com o dedo, entre 0 e 140 mm.
- Use **Esconder medidas** para praticar e **Mostrar medidas** para conferir milímetros e polegadas simultaneamente.
- **Ampliar nônio** amplia o próprio instrumento; **Visão geral** restaura o enquadramento. O arraste continua funcionando com zoom.
- A página ocupa a área útil da tela, sem rolagem. Os três botões, a leitura no canto inferior direito e os créditos ficam em uma camada fixa. Os links dos créditos abrem em nova guia.
- O tema synthwave escuro é o padrão; o primeiro botão alterna para o tema claro e a preferência é salva quando o navegador permite. As cores do paquímetro são preservadas.
- No zoom, a câmera acompanha o movimento durante o arraste. Com as medidas visíveis, os traços correspondentes nas escalas fixa e móvel ficam vermelhos. Na escala de polegadas, o destaque indica o par mais próximo da coincidência, conforme o arredondamento a 1/128.
- A inscrição vertical `www.marciovoss.com` tem fonte de 40 px, ajustada ao corpo do instrumento, e abre o site em nova guia.
- Com o cursor selecionado, use as setas para ajustar 0,05 mm, Shift + seta para 1 mm e Home / End para os limites.

### Arquivos e calibração

`index.html` incorpora o SVG de `assets/paquimetro_grupos_animaveis.svg` para permitir interação e abertura local sem requisições externas. `style.css` contém a interface responsiva e `script.js` controla movimento, escalas e leitura. Os SVGs de trabalho foram ajustados; `assets/Vernier_caliper_original.svg` preserva a ilustração original.

A escala fixa usa 12,6 unidades SVG por milímetro. As marcações do nônio são recalculadas na página: 20 intervalos ocupam 39 mm, dando resolução de 0,05 mm. O zero é alinhado com os bicos externos e as orelhas superiores fechados. O curso de 140 mm mantém o alojamento do cursor sobre a régua do desenho. A haste pode sair da tela sem alterar o enquadramento. A inscrição vertical no corpo é `www.marciovoss.com`.

Ordem das camadas no SVG agrupado: `cursor-traseiro` (haste alongada e orelha móvel), `corpo-fixo` e `cursor-movel` (nônio e bico inferior). Os dois grupos móveis recebem a mesma translação. A ponta da haste fica alinhada ao fim da régua quando fechado e avança conforme a abertura. Ao reutilizar o SVG separado do cursor, intercale o corpo fixo entre os dois grupos móveis.

O visor apresenta milímetros com duas casas decimais e, na segunda linha, polegadas em fração simplificada e decimal com três casas. A fração é aproximada ao múltiplo de 1/128 mais próximo; o decimal é convertido diretamente dos milímetros usando 25,4 mm por polegada. Por isso, os dois arredondamentos podem diferir ligeiramente. O movimento continua em incrementos de 0,05 mm.

Referência de interação: [simulador do Prof. Eduardo Stefanelli](https://www.stefanelli.eng.br/paquimetro-virtual-simulador-milimetro-05/).

## Créditos

O desenho do paquímetro é baseado em
[Vernier caliper.svg](https://commons.wikimedia.org/wiki/File:Vernier_caliper.svg),
de Joaquim Alves Gaspar, com modificações posteriores por ed g2s e outros colaboradores.

Licença da ilustração original: [Creative Commons Attribution 2.5 Generic (CC BY 2.5)](https://creativecommons.org/licenses/by/2.5/).

Modificações nesta versão: elementos reorganizados em grupos para permitir a animação; legendas explicativas removidas.
