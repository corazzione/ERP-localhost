import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Iniciando seed do banco de dados...');

    // Criar usuário admin
    const senhaHash = await bcrypt.hash('senha123', 10);
    const admin = await prisma.usuario.upsert({
        where: { email: 'admin@erp.com' },
        update: {},
        create: {
            nome: 'Administrador',
            email: 'admin@erp.com',
            senha: senhaHash,
            role: 'admin'
        }
    });
    console.log('✅ Usuário admin criado:', admin.email);

    // Criar alguns clientes de exemplo
    const cliente1 = await prisma.cliente.upsert({
        where: { cpfCnpj: '12345678900' },
        update: {},
        create: {
            nome: 'João da Silva',
            cpfCnpj: '12345678900',
            email: 'joao@email.com',
            telefone: '(11) 98765-4321',
            limiteCredito: 5000,
            saldoDevedor: 0
        }
    });

    const cliente2 = await prisma.cliente.upsert({
        where: { cpfCnpj: '98765432100' },
        update: {},
        create: {
            nome: 'Maria Santos',
            cpfCnpj: '98765432100',
            email: 'maria@email.com',
            telefone: '(11) 91234-5678',
            limiteCredito: 3000,
            saldoDevedor: 0
        }
    });
    console.log('✅ Clientes criados');

    // Criar alguns produtos de exemplo
    const produtos = [
        {
            codigo: 'PROD001',
            nome: 'Notebook Dell Inspiron',
            descricao: 'Notebook Dell i5 8GB RAM 256GB SSD',
            categoria: 'Informática',
            precoVenda: 3500,
            precoCusto: 2800,
            estoqueAtual: 10,
            estoqueMinimo: 2
        },
        {
            codigo: 'PROD002',
            nome: 'Mouse Logitech',
            descricao: 'Mouse sem fio Logitech',
            categoria: 'Periféricos',
            precoVenda: 150,
            precoCusto: 90,
            estoqueAtual: 50,
            estoqueMinimo: 10
        },
        {
            codigo: 'PROD003',
            nome: 'Teclado Mecânico',
            descricao: 'Teclado mecânico RGB',
            categoria: 'Periféricos',
            precoVenda: 450,
            precoCusto: 300,
            estoqueAtual: 25,
            estoqueMinimo: 5
        },
        {
            codigo: 'PROD004',
            nome: 'Monitor LG 24"',
            descricao: 'Monitor LG 24 polegadas Full HD',
            categoria: 'Monitores',
            precoVenda: 800,
            precoCusto: 600,
            estoqueAtual: 15,
            estoqueMinimo: 3
        },
        {
            codigo: 'PROD005',
            nome: 'Cadeira Gamer',
            descricao: 'Cadeira gamer ergonômica',
            categoria: 'Mobiliário',
            precoVenda: 1200,
            precoCusto: 800,
            estoqueAtual: 8,
            estoqueMinimo: 2
        }
    ];

    for (const prodData of produtos) {
        await prisma.produto.upsert({
            where: { codigo: prodData.codigo },
            update: {},
            create: prodData
        });
    }
    console.log('✅ Produtos criados');

    // Criar fornecedor
    await prisma.fornecedor.upsert({
        where: { cnpj: '12345678000199' },
        update: {},
        create: {
            nome: 'Tech Distribuidora LTDA',
            cnpj: '12345678000199',
            email: 'contato@techdist.com',
            telefone: '(11) 3333-4444',
            endereco: 'Av. Paulista, 1000'
        }
    });
    console.log('✅ Fornecedor criado');

    // Configurações do sistema
    await prisma.configuracao.upsert({
        where: { chave: 'taxa_juros_mora_diaria' },
        update: {},
        create: {
            chave: 'taxa_juros_mora_diaria',
            valor: '0.033'
        }
    });

    await prisma.configuracao.upsert({
        where: { chave: 'multa_atraso_percentual' },
        update: {},
        create: {
            chave: 'multa_atraso_percentual',
            valor: '2'
        }
    });

    await prisma.configuracao.upsert({
        where: { chave: 'taxa_juros_crediario_padrao' },
        update: {},
        create: {
            chave: 'taxa_juros_crediario_padrao',
            valor: '2.5'
        }
    });

    console.log('✅ Configurações criadas');
    console.log('\n🎉 Seed concluído com sucesso!');
    console.log('\n📝 Credenciais de acesso:');
    console.log('  Email: admin@erp.com');
    console.log('  Senha: senha123\n');
}

main()
    .catch((e) => {
        console.error('❌ Erro no seed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
