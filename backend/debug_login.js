import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function testLogin() {
    console.log('Testing login logic...');
    const email = 'admin@erp.com';
    const password = 'senha123'; // Correct password

    try {
        console.log(`Searching for user: ${email}`);
        const usuario = await prisma.usuario.findUnique({
            where: { email }
        });

        if (!usuario) {
            console.log('User not found!');
            // List all users to see what we have
            const allUsers = await prisma.usuario.findMany();
            console.log('All users:', allUsers);
            return;
        }

        console.log('User found:', usuario.email, usuario.role);
        console.log('Stored hash:', usuario.senha);

        const valid = await bcrypt.compare(password, usuario.senha);
        console.log(`Password '${password}' valid?`, valid);

        if (!valid) {
            // Try 'senha123' just in case
            const valid2 = await bcrypt.compare('senha123', usuario.senha);
            console.log(`Password 'senha123' valid?`, valid2);
        }

    } catch (error) {
        console.error('Error during test:', error);
    } finally {
        await prisma.$disconnect();
    }
}

testLogin();
