const Pagamento = require('../class/Pagamento');
const { Op }    = require('sequelize');
const Utenti    = require('../class/Utente');

///classe per svolgere operazioni di pagamento piuttosto che avere tutto sulla classe pagamento

class PagamentoService 
{

    static async creaPagamento(dati) 
    {
        const utente = await Utenti.findByPk(dati.idUtente);
        
        if (!utente) { throw new Error('Utente non trovato'); }
        try{
            // Validazione base
            if (!dati.cartaDiCredito || dati.costoTotale <= 0 || !dati.idUtente)  
            {
                throw new Error('Dati non validi per il pagamento');
            }
            
            // Validazione del formato della carta di credito (esempio base)
            const regexCarta = /^[0-9]{16}$/;
            if (!regexCarta.test(dati.cartaDiCredito)) {
                throw new Error('Formato carta di credito non valido');
            }
            return await Pagamento.create(dati);
            } catch (error)
            {
                console.error('errore nella creazione del pagamento:', error.message);
                throw error;
            }
    }

    static async trovaPagamentiPerUtente(utenteId) 
    {
        try
        {
            return await Pagamento.findAll({ where: { idUtente: utenteId } });
        } catch(error)
        {
            console.error('errore nella ricerca dei pagamenti per utente:', error.message);
            throw error;
        }        
    }

    static async trovaPagamentiPerintevallo(giornoI, orarioI, giornoF, orarioF, tipoUtente) {
    try {
        
        const dataInizio = new Date(`${giornoI} ${orarioI}`);
        const dataFine = new Date(`${giornoF} ${orarioF}`);
        if (dataInizio > dataFine) {
            throw new Error('La data di inizio non può essere successiva alla data di fine');
        }

        const condizioni = {
            dataOrario: {
                [Op.between]: [dataInizio, dataFine]
            }
        };

        const includeCondition = tipoUtente
            ? [{
                model: Utenti,
                where: { tipo: tipoUtente },
                required: true
                }]
            : [];

        return await Pagamento.findAll({
            where: condizioni,
            include: includeCondition
        });
    } catch (error) {
        console.error('errore nella ricerca dei pagamenti per intervallo:', error.message);
        throw error;
    }
}




    static async trovaPagamentiPerTipo(tipoPagamento) 
    {
        try
        {
            return await Pagamento.findAll({ where: { tipoPagamento } });
        }
        catch(error)
        {
            console.error('errore nella ricerca dei pagamenti per tipo:', error.message);throw error;
        }

    }



    static async trovaPagamentiPerTipoUtente(tipoUtente) 
    {
        try
        {
            return await Pagamento.findAll({
            include: [{
                model: Utenti,
                where: { tipo: tipoUtente },
                required: true
            }]
            });
        }catch(error)
        {
            console.error('errore nella ricerca dei pagamenti per tipo utente:', error.message);throw error;
        }
    
    }

    static async trovaPagamentoById(idPagamento)
    {
        try {
            return await Pagamento.findByPk(idPagamento);
        } catch (error) {
            console.error('Errore nella ricerca del pagamento per ID:', error.message);
            throw error;
        }
    }
}

module.exports = PagamentoService;