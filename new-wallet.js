const StellarSdk = require('stellar-sdk');
const StellarHDWallet = require('stellar-hd-wallet');
const fs = require('fs');

async function createWallet() { // Cria uma nova carteira
    try {
        // Gerar um novo par de chaves
        const pair = StellarSdk.Keypair.random();
        
        // Gerar mnemônico
        const mnemonic = StellarHDWallet.generateMnemonic();
        
        // Criar objeto com as informações da carteira
        const walletInfo = {
            publicKey: pair.publicKey(),
            secretKey: pair.secret(),
            mnemonic: mnemonic,
            dateCreated: new Date().toISOString()
        };

        // Salvar em um arquivo
        fs.writeFileSync('wallet_info.txt', 
`INFORMAÇÕES DA CARTEIRA STELLAR
==============================
Data de criação: ${walletInfo.dateCreated}
Chave Pública: ${walletInfo.publicKey}
Chave Privada: ${walletInfo.secretKey}

FRASE MNEMÔNICA (Seed Phrase):
${walletInfo.mnemonic}

IMPORTANTE:
1. Nunca compartilhe sua chave privada ou frase mnemônica
2. Faça backup deste arquivo
3. A frase mnemônica permite recuperar sua carteira
4. Compartilhe apenas a chave pública
`);

        console.log('✅ Carteira criada com sucesso!');
        console.log('📋 Chave pública:', pair.publicKey());
        console.log('🌱 Frase mnemônica gerada e salva no arquivo');
        console.log('🔐 Todas as informações foram salvas em wallet_info.txt');
        console.log('\n⚠️  ATENÇÃO: Faça backup do arquivo wallet_info.txt imediatamente!');

        // Verificar status da conta
        await verificarStatus(pair.publicKey());

    } catch (error) {
        console.error('Erro ao criar carteira:', error);
    }
}

async function verificarStatus(publicKey) { // Verifica se a conta está ativa
    const server = new StellarSdk.Server('https://horizon.stellar.org');
    try {
        const account = await server.loadAccount(publicKey);
        console.log('✅ Conta ativa!');
        console.log('💰 Saldos:');
        account.balances.forEach((balance) => {
            console.log(`   ${balance.asset_type}: ${balance.balance}`);
        });
    } catch (error) { // Se a conta não está ativa
        if (error.response && error.response.status === 404) {
            console.log('❌ Conta ainda não ativada');
            console.log('ℹ️  Você pode visualizar a conta em:');
            console.log(`   https://stellar.expert/explorer/public/account/${publicKey}`);
            console.log('⚠️  É necessário receber pelo menos 1 XLM para ativar a conta');
        } else {
            console.error('Erro ao verificar conta:', error);
        }
    }
}

// Executar a criação da carteira
createWallet();