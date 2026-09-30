const PrenotazioneService = require("../services/prenotazioneService");
const Prenotazione = require("../class/Prenotazione");
const Posto = require("../class/Posto");
const Utente = require("../class/Utente");


jest.mock("../class/Prenotazione", () => {
    const SequelizeMock = require("sequelize-mock");
    const dbMock = new SequelizeMock();
    const Prenotazione = dbMock.define("Prenotazione", {
        id: 1,
        dataPrenotazione: new Date(),
        targaAuto: "ABC123",
        orario: new Date(),
        durata: 60,
        id_utente: 1,
        id_posto: 1
    });

    Prenotazione.create = jest.fn();
    Prenotazione.findByPk = jest.fn();
    Prenotazione.findAll = jest.fn();

    return Prenotazione;
});




jest.mock("../class/Sosta", () => {
    const SequelizeMock = require("sequelize-mock");
    const dbMock = new SequelizeMock();
    return dbMock.define("Sosta", {
        id_sosta: 1,
        id_utente: 1,
        id_posto: 1,
        orario_inizio: new Date(),
        orario_fine: new Date(),
        costo: 10
    });
});

jest.mock("../class/Parcheggio", () => {
    const SequelizeMock = require("sequelize-mock");
    const dbMock = new SequelizeMock();
    return dbMock.define("Parcheggio", {
        numeroPosti: 10,
        postiPrenotabili: 100,
    });
});


jest.mock("../class/Pagamento", () => {
    const SequelizeMock = require("sequelize-mock");
    const dbMock = new SequelizeMock();
    return dbMock.define("Pagamento", {
        idPagamento: 1,
        costoTotale: 20.00,
        cartaDiCredito: "1234567890123456",
        idUtente: 1,
        dataOrario: new Date(),
    });
});


jest.mock("../class/Utente", () => {
    const SequelizeMock = require("sequelize-mock");
    const dbMock = new SequelizeMock();
    const UtenteMock = dbMock.define("Utente", {
            id: 1,
            username: "testuser",
            password: "password123",
            tipo: "premium"
        });

    UtenteMock.findByPk = jest.fn().mockImplementation((id) => 
        id === 1 ? Promise.resolve({ id: 1, username: "testuser", tipo: "premium" }) : Promise.resolve(null)
    );
    return UtenteMock;

});

jest.mock("../class/Posto", () => {
    return {
        findOne: jest.fn(),
        create: jest.fn(),
        save: jest.fn().mockResolvedValue(true),
        findByPk: jest.fn(),  // 🔹 Aggiunto il mock per `findByPk`
        belongsTo: jest.fn(),
        hasOne: jest.fn()
    };
});




jest.mock("../class/Ricarica", () => {
    const SequelizeMock = require("sequelize-mock");
    const dbMock = new SequelizeMock();
    return dbMock.define("Ricarica", {
        id: 1,
        utenteId: 1,
        percentualeIniziale: 20,
        percentualeFinale: 80,
        costo: 15.50,
        stato: "in coda", // Stati possibili: 'in coda', 'in corso', 'completata'
        priorita: 2, // 1 per utenti premium, 2 per base
    });
});

jest.mock("../config/MQTT", () => ({
    client: {
        publish: jest.fn(),  // Simula l'invio di messaggi
        connected: false     // Simula che il client MQTT non sia connesso
    }
}));

jest.mock("../config/database", () => {
    const SequelizeMock = require("sequelize-mock");
    const dbMock = new SequelizeMock();
    return { sequelize: dbMock };
});


describe("PrenotazioneService", () => {
    beforeEach(() => {
        jest.clearAllMocks(); // Reset dei mock prima di ogni test
    });
    beforeAll(() => {
        jest.spyOn(console, 'error').mockImplementation(() => {}); // Silenzia gli errori in test
    });
    afterAll(() => {
        console.error.mockRestore(); // Ripristina il comportamento originale dopo i test
    });




    test("crea due prenotazioni con successo", async () => {
        // Simula due prenotazioni
        const prenotazioneMock1 = {
            id: 1,
            dataPrenotazione: new Date(),
            targaAuto: "ABC123",
            orario: new Date(),
            durata: 60,
            id_utente: 1,
            id_posto: 1,
        };

        const prenotazioneMock2 = {
            id: 2,
            dataPrenotazione: new Date(),
            targaAuto: "XYZ789",
            orario: new Date(),
            durata: 120,
            id_utente: 1, // Stesso utente della prima prenotazione
            id_posto: 2,
        };

        // Mock per `Posto.findOne()` per entrambi i posti
        Posto.findOne
            .mockResolvedValueOnce({ id: 1, prenotabile: true, occupato: false, save: jest.fn() })
            .mockResolvedValueOnce({ id: 2, prenotabile: true, occupato: false, save: jest.fn() });

        // Mock per `Prenotazione.create()`
        Prenotazione.create
            .mockResolvedValueOnce(prenotazioneMock1)
            .mockResolvedValueOnce(prenotazioneMock2);

        // Esegui le creazioni
        const nuovaPrenotazione1 = await PrenotazioneService.creaPrenotazione(1, 1, "ABC123", new Date(), 60);
        const nuovaPrenotazione2 = await PrenotazioneService.creaPrenotazione(1, 2, "XYZ789", new Date(), 120);

        // Verifica che entrambe siano state create correttamente
        expect(nuovaPrenotazione1).toEqual(prenotazioneMock1);
        expect(nuovaPrenotazione2).toEqual(prenotazioneMock2);
    });




    test("recupera una prenotazione tramite ID", async () => {
        const prenotazioneMock = {
            id: 1,
            dataPrenotazione: new Date(),
            targaAuto: "ABC123",
            orario: new Date(),
            durata: 60,
            id_utente: 1,
            id_posto: 1,
        };

        // Mock per `Prenotazione.findByPk()`
        Prenotazione.findByPk.mockResolvedValue(prenotazioneMock);

        // Esegui la ricerca
        const result = await PrenotazioneService.getPrenotazione(1);

        // Verifica che il risultato sia corretto
        expect(result).toEqual(prenotazioneMock);
        expect(Prenotazione.findByPk).toHaveBeenCalledWith(1);
    });




    test("recupera tutte le prenotazioni di un utente", async () => {
        const prenotazioniMock = [
            {
                id: 1,
                dataPrenotazione: new Date(),
                targaAuto: "ABC123",
                orario: new Date(),
                durata: 60,
                id_utente: 1,
                id_posto: 1,
            },
            {
                id: 2,
                dataPrenotazione: new Date(),
                targaAuto: "XYZ789",
                orario: new Date(),
                durata: 120,
                id_utente: 1,
                id_posto: 2,
            },
        ];

        // Mock per `Prenotazione.findAll()`
        Prenotazione.findAll.mockResolvedValue(prenotazioniMock);

        // Esegui la ricerca
        const result = await PrenotazioneService.getPrenotazioniUtente(1);

        // Verifica che il risultato sia corretto
        expect(result).toEqual(prenotazioniMock);
        expect(Prenotazione.findAll).toHaveBeenCalledWith({ where: { id_utente: 1 } });
    });



////////////////////////////////////////////////////////////// NUOVI /////////////////////////////
    test("cancella una prenotazione con successo", async () => {
    const prenotazioneMock = {
        id: 1,
        id_posto: 1,
        destroy: jest.fn()
    };

    const postoMock = {
        id: 1,
        occupato: true,
        save: jest.fn()
    };

    Prenotazione.findByPk.mockResolvedValue(prenotazioneMock);
    Posto.findByPk.mockResolvedValue(postoMock);

    const result = await PrenotazioneService.cancellaPrenotazione(1);

    expect(prenotazioneMock.destroy).toHaveBeenCalled();
    expect(postoMock.occupato).toBe(false);
    expect(postoMock.save).toHaveBeenCalled();
    expect(result).toEqual({ messaggio: "Prenotazione cancellata con successo." });
    });




    test("fallisce se l'utente non esiste", async () => {
        const Posto = require("../class/Posto");
        Posto.findOne.mockResolvedValue({ id: 1, prenotabile: true, occupato: false, save: jest.fn() });

        const Utente = require("../class/Utente");
        Utente.findByPk = jest.fn().mockResolvedValue(null); // Utente non esistente

        await expect(
            PrenotazioneService.creaPrenotazione(99, 1, "XYZ123", new Date(), 60)
        ).rejects.toThrow("Utente non trovato.");
    });




    test("fallisce se la prenotazione da cancellare non esiste", async () => {
        Prenotazione.findByPk.mockResolvedValue(null); // Prenotazione non esistente

        await expect(
            PrenotazioneService.cancellaPrenotazione(99)
        ).rejects.toThrow("Prenotazione non trovata.");
    });




    test("fallisce se si verifica un errore nella cancellazione della prenotazione", async () => {
        const prenotazioneMock = {
            id: 1,
            id_posto: 1,
            destroy: jest.fn().mockRejectedValue(new Error("Errore nel database"))
        };

        Prenotazione.findByPk.mockResolvedValue(prenotazioneMock);

        await expect(PrenotazioneService.cancellaPrenotazione(1)).rejects.toThrow("Errore nel database");
    });





    test("fallisce se il database è offline durante il recupero delle prenotazioni", async () => {
        Prenotazione.findAll.mockRejectedValue(new Error("Database non disponibile"));

        await expect(PrenotazioneService.getPrenotazioniUtente(1)).rejects.toThrow("Database non disponibile");
    });



    test("Non deve permettere di prenotare se i posti sono esauriti", async () => {
        Utente.findByPk.mockResolvedValue({ id: 1 });
        Posto.findOne.mockResolvedValue(null);

        await expect(PrenotazioneService.creaPrenotazione(1, 1, "ABC123", "10:00", 2))
            .rejects.toThrow("Posto non disponibile.");
    });



    test("Gestisce correttamente la concorrenza nella prenotazione", async () => {
        Utente.findByPk.mockResolvedValue({ id: 1 });
        Posto.findOne.mockResolvedValue({ id: 1, occupato: false, save: jest.fn() });
        Prenotazione.count = jest.fn();
        Prenotazione.count.mockResolvedValue(1);

        await expect(PrenotazioneService.creaPrenotazione(1, 1, "ABC123", "10:00", 2))
            .rejects.toThrow("Limite prenotazioni raggiunto per questo posto.");
    });

});
