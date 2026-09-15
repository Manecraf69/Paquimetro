## Simulador de paquímetro

Abra `index.html` diretamente no navegador. Não é necessário instalar dependências ou iniciar um servidor.

- Arraste a parte móvel com o mouse ou com o dedo, entre 0 e 140 mm.
- Use **Esconder medida** para praticar e **Mostrar medida** para conferir.
- **Unidade** alterna o visor entre milímetros e polegadas decimais, sem alterar a abertura.
- **Ampliar nônio** abre uma lupa que acompanha o cursor e também permite arrastar.
- Com o cursor selecionado, use as setas para ajustar 0,05 mm, Shift + seta para 1 mm e Home / End para os limites.

### Arquivos e calibração

`index.html` incorpora o SVG de `assets/paquimetro_grupos_animaveis.svg` para permitir interação e abertura local sem requisições externas. `style.css` contém a interface responsiva e `script.js` controla movimento, escalas e leitura. Os SVGs originais foram preservados.

A escala fixa usa 12,6 unidades SVG por milímetro. As marcações do nônio são recalculadas na página: 20 intervalos ocupam 39 mm, dando resolução de 0,05 mm. O zero é alinhado com os bicos externos fechados. O curso de 140 mm mantém o alojamento do cursor sobre a régua do desenho. A haste de profundidade pode sair da área visível nas maiores aberturas.

O visor em polegadas usa a conversão exata de 25,4 mm por polegada, exibida com quatro casas decimais; o movimento continua em incrementos de 0,05 mm. A escala superior representa o nônio fracionário de 1/128 de polegada do desenho e não define a resolução do visor decimal.

Referência de interação: [simulador do Prof. Eduardo Stefanelli](https://www.stefanelli.eng.br/paquimetro-virtual-simulador-milimetro-05/).

## Créditos

O desenho do paquímetro é baseado em
[Vernier caliper.svg](https://commons.wikimedia.org/wiki/File:Vernier_caliper.svg),
de Joaquim Alves Gaspar, com modificações posteriores por ed g2s e outros colaboradores.

Licença da ilustração original: [Creative Commons Attribution 2.5 Generic (CC BY 2.5)](https://creativecommons.org/licenses/by/2.5/).

Modificações nesta versão: elementos reorganizados em grupos para permitir a animação; legendas explicativas removidas.
