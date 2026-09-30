--
-- PostgreSQL database dump
--

-- Dumped from database version 14.3
-- Dumped by pg_dump version 14.17 (Homebrew)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

DROP DATABASE IF EXISTS postgres;
--
-- Name: postgres; Type: DATABASE; Schema: -; Owner: postgres
--

CREATE DATABASE postgres WITH TEMPLATE = template0 ENCODING = 'UTF8' LOCALE = 'C';


ALTER DATABASE postgres OWNER TO postgres;

\connect postgres

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: DATABASE postgres; Type: COMMENT; Schema: -; Owner: postgres
--

COMMENT ON DATABASE postgres IS 'default administrative connection database';


--
-- Name: adminpack; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS adminpack WITH SCHEMA pg_catalog;


--
-- Name: EXTENSION adminpack; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION adminpack IS 'administrative functions for PostgreSQL';


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: Pagamento; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Pagamento" (
    "costoTotale" real,
    "cartaDiCredito" text,
    "idUtente" integer,
    dataorario timestamp without time zone,
    "idPagamento" integer NOT NULL
);


ALTER TABLE public."Pagamento" OWNER TO postgres;

--
-- Name: Pagamento_idPagamento_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public."Pagamento" ALTER COLUMN "idPagamento" ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public."Pagamento_idPagamento_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: parcheggio; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.parcheggio (
    "PostoID" integer NOT NULL,
    "postiPrenotabili" integer,
    "numeroPosti" integer
);


ALTER TABLE public.parcheggio OWNER TO postgres;

--
-- Name: prenotazione; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.prenotazione (
    id integer,
    dataprenotazione date,
    targa character varying NOT NULL,
    orario time with time zone,
    durata interval,
    idprenotazione integer,
    "Idricarica" integer
);


ALTER TABLE public.prenotazione OWNER TO postgres;

--
-- Name: ricarica; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.ricarica (
    costoiniziale character varying[],
    percetualefinale character varying,
    accettazionericarica boolean,
    costofinale character varying,
    durata interval,
    "percentualeIniziale" integer,
    idricarica integer NOT NULL,
    id integer
);


ALTER TABLE public.ricarica OWNER TO postgres;

--
-- Name: utente; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.utente (
    id integer NOT NULL,
    username text,
    password text,
    numerotelefono character varying,
    email text,
    tipo text,
    "datiPagamento" bigint
);


ALTER TABLE public.utente OWNER TO postgres;

--
-- Name: utente_Id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.utente ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public."utente_Id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Data for Name: Pagamento; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Pagamento" ("costoTotale", "cartaDiCredito", "idUtente", dataorario, "idPagamento") FROM stdin;
4.5	4025398765443234	1	2025-01-21 15:34:03	2
6	4025398765443234	1	2024-12-01 17:34:09	1
\.


--
-- Data for Name: parcheggio; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.parcheggio ("PostoID", "postiPrenotabili", "numeroPosti") FROM stdin;
\.


--
-- Data for Name: prenotazione; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.prenotazione (id, dataprenotazione, targa, orario, durata, idprenotazione, "Idricarica") FROM stdin;
\.


--
-- Data for Name: ricarica; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.ricarica (costoiniziale, percetualefinale, accettazionericarica, costofinale, durata, "percentualeIniziale", idricarica, id) FROM stdin;
\.


--
-- Data for Name: utente; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.utente (id, username, password, numerotelefono, email, tipo, "datiPagamento") FROM stdin;
5	migje	daDDymurh	3274598826	mig.je@gmail.com	premium	4025678954323457
1	Alessandro	Babaciu21	3402301192	alessandro.gueli2001@gmail.com	amministratore	4025398765443234
\.


--
-- Name: Pagamento_idPagamento_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Pagamento_idPagamento_seq"', 2, true);


--
-- Name: utente_Id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."utente_Id_seq"', 5, true);


--
-- Name: parcheggio parcheggio_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.parcheggio
    ADD CONSTRAINT parcheggio_pkey PRIMARY KEY ("PostoID");


--
-- Name: prenotazione prenotazione_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.prenotazione
    ADD CONSTRAINT prenotazione_pkey PRIMARY KEY (targa);


--
-- Name: ricarica ricarica_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ricarica
    ADD CONSTRAINT ricarica_pkey PRIMARY KEY (idricarica);


--
-- Name: utente utente_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.utente
    ADD CONSTRAINT utente_pkey PRIMARY KEY (id);


--
-- PostgreSQL database dump complete
--

