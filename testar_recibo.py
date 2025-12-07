import pdfkit
import os

# Caminho do arquivo HTML
html_path = os.path.join("backend", "recibo.html")
output_pdf = "recibo-teste-python.pdf"

# Dados fake para preenchimento
fake_data = {
    "{{nome_cliente}}": "João da Silva",
    "{{endereco_linha_1}}": "Rua das Flores, 123",
    "{{endereco_linha_2}}": "Bairro Feliz, Cidade - UF",
    "{{endereco_linha_3}}": "CEP 12345-678",
    "{{endereco_linha_4}}": "",
    "{{telefone_cliente}}": "(11) 99999-9999",
    "{{data}}": "06/12/2025",
    "{{data_emissao}}": "06/12/2025",
    "{{numero_recibo}}": "000001",
    "{{subtotal}}": "R$ 100,00",
    "{{desconto}}": "R$ 0,00",
    "{{valor_total}}": "R$ 100,00",
    "{{metodo_pagamento}}": "Dinheiro",
    "{{entrada}}": "R$ 100,00",
    "{{parcelamento}}": "À vista",
    "{{itens_tabela}}": """
        <div class="t m0 x9 h4 y3 ff3 fs1 fc1 sc0 ls0" style="bottom: 530.58px">1</div>
        <div class="t m0 x3 h4 y3 ff3 fs1 fc1 sc0 ls0 ws1" style="bottom: 530.58px">Produto Teste 1</div>
        <div class="t m0 x4 h4 y3 ff3 fs1 fc1 sc0 ls0 ws1" style="bottom: 530.58px">R$ 50,00</div>
        <div class="t m0 x5 h4 y3 ff3 fs1 fc1 sc0 ls0" style="bottom: 530.58px">1</div>
        <div class="t m0 x6 h4 y3 ff3 fs1 fc1 sc0 ls0 ws1" style="bottom: 530.58px">R$ 50,00</div>
        
        <div class="t m0 x9 h4 y3 ff3 fs1 fc1 sc0 ls0" style="bottom: 502.98px">2</div>
        <div class="t m0 x3 h4 y3 ff3 fs1 fc1 sc0 ls0 ws1" style="bottom: 502.98px">Produto Teste 2</div>
        <div class="t m0 x4 h4 y3 ff3 fs1 fc1 sc0 ls0 ws1" style="bottom: 502.98px">R$ 50,00</div>
        <div class="t m0 x5 h4 y3 ff3 fs1 fc1 sc0 ls0" style="bottom: 502.98px">1</div>
        <div class="t m0 x6 h4 y3 ff3 fs1 fc1 sc0 ls0 ws1" style="bottom: 502.98px">R$ 50,00</div>
    """
}

try:
    # Ler o HTML
    if not os.path.exists(html_path):
        print(f"Erro: Arquivo {html_path} não encontrado.")
        exit(1)

    with open(html_path, "r", encoding="utf-8") as f:
        html_content = f.read()

    # Preencher placeholders
    for key, value in fake_data.items():
        html_content = html_content.replace(key, value)

    # Configuração do wkhtmltopdf (opcional, tente encontrar no PATH)
    # Se der erro de "No wkhtmltopdf executable found", configure o path aqui:
    # config = pdfkit.configuration(wkhtmltopdf=r'C:\Program Files\wkhtmltopdf\bin\wkhtmltopdf.exe')
    
    # Gerar PDF
    options = {
        'page-size': 'A4',
        'encoding': "UTF-8",
        'no-outline': None
    }
    
    print("Gerando PDF...")
    pdfkit.from_string(html_content, output_pdf, options=options)
    # pdfkit.from_string(html_content, output_pdf, options=options, configuration=config) # Use se configurar path
    
    print(f"Sucesso! PDF gerado em: {os.path.abspath(output_pdf)}")

except Exception as e:
    print(f"Erro ao gerar PDF: {e}")
    print("Dica: Verifique se o wkhtmltopdf está instalado e no PATH do sistema, ou configure o caminho no script.")
