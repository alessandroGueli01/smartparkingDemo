const PagamentoService = require('../services/PagamentoService');
const Pagamento = require('../class/Pagamento');
const Utenti = require('../class/Utente');
const { Op } = require('sequelize');

jest.mock('../class/Pagamento', () => {
    const SequelizeMock = require('sequelize-mock');
    const dbMock = new SequelizeMock();
    const PagamentoMock = dbMock.define('Pagamento', {
        idPagamento: 1,
        costoTotale: 20.00,
        cartaDiCredito: '1234567890123456',
        idUtente: 1,
        dataOrario: new Date(),
    });
    PagamentoMock.create = jest.fn();
    PagamentoMock.findAll = jest.fn();
    PagamentoMock.findByPk = jest.fn();
    return PagamentoMock;
});

jest.mock('../class/Utente', () => {
    const SequelizeMock = require('sequelize-mock');
    const dbMock = new SequelizeMock();
    const UtenteMock = dbMock.define('Utente', {
        id: 1,
        username: 'testuser',
        tipo: 'premium'
    });
    UtenteMock.findByPk = jest.fn();
    return UtenteMock;
});

describe('PagamentoService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('crea un pagamento con successo', async () => {
        Utenti.findByPk.mockResolvedValue({ id: 1, username: 'testuser', tipo: 'premium' });
        Pagamento.create.mockResolvedValue({ idPagamento: 1, costoTotale: 20.00, cartaDiCredito: '1234567890123456', idUtente: 1 });
        
        const datiPagamento = {
            idUtente: 1,
            costoTotale: 20.00,
            cartaDiCredito: '1234567890123456'
        };
        
        const pagamento = await PagamentoService.creaPagamento(datiPagamento);
        
        expect(pagamento).toEqual({ idPagamento: 1, costoTotale: 20.00, cartaDiCredito: '1234567890123456', idUtente: 1 });
        expect(Pagamento.create).toHaveBeenCalledWith(datiPagamento);
    });

    test('fallisce la creazione di un pagamento se l\'utente non esiste', async () => {
        Utenti.findByPk.mockResolvedValue(null);
        
        await expect(PagamentoService.creaPagamento({ idUtente: 99, costoTotale: 50.00, cartaDiCredito: '1234567890123456' }))
            .rejects.toThrow('Utente non trovato');
    });

    test('trova i pagamenti per un utente', async () => {
        const pagamentiMock = [
            { idPagamento: 1, costoTotale: 20.00, cartaDiCredito: '1234567890123456', idUtente: 1 },
            { idPagamento: 2, costoTotale: 30.00, cartaDiCredito: '6543210987654321', idUtente: 1 }
        ];
        
        Pagamento.findAll.mockResolvedValue(pagamentiMock);
        
        const result = await PagamentoService.trovaPagamentiPerUtente(1);
        
        expect(result).toEqual(pagamentiMock);
        expect(Pagamento.findAll).toHaveBeenCalledWith({ where: { idUtente: 1 } });
    });

    test('trova un pagamento per ID', async () => {
        const pagamentoMock = { idPagamento: 1, costoTotale: 20.00, cartaDiCredito: '1234567890123456', idUtente: 1 };
        
        Pagamento.findByPk.mockResolvedValue(pagamentoMock);
        
        const result = await PagamentoService.trovaPagamentoById(1);
        
        expect(result).toEqual(pagamentoMock);
        expect(Pagamento.findByPk).toHaveBeenCalledWith(1);
    });
});
