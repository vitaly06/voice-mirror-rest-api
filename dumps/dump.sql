--
-- PostgreSQL database dump
--


-- Dumped from database version 17.6
-- Dumped by pg_dump version 17.6

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

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: Audio; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Audio" (
    id integer NOT NULL,
    "clonedUrl" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "originalUrl" text NOT NULL,
    status text DEFAULT 'processing'::text NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "voiceId" text
);


ALTER TABLE public."Audio" OWNER TO postgres;

--
-- Name: Audio_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."Audio_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Audio_id_seq" OWNER TO postgres;

--
-- Name: Audio_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."Audio_id_seq" OWNED BY public."Audio".id;


--
-- Name: Avatar; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Avatar" (
    id integer NOT NULL,
    name text NOT NULL,
    "imageUrl" text NOT NULL,
    description text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Avatar" OWNER TO postgres;

--
-- Name: AvatarAnimation; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."AvatarAnimation" (
    id integer NOT NULL,
    "avatarId" integer NOT NULL,
    "audioUrl" text NOT NULL,
    "videoUrl" text NOT NULL,
    text text,
    "voiceId" text,
    status text DEFAULT 'processing'::text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."AvatarAnimation" OWNER TO postgres;

--
-- Name: AvatarAnimation_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."AvatarAnimation_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."AvatarAnimation_id_seq" OWNER TO postgres;

--
-- Name: AvatarAnimation_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."AvatarAnimation_id_seq" OWNED BY public."AvatarAnimation".id;


--
-- Name: Avatar_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."Avatar_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Avatar_id_seq" OWNER TO postgres;

--
-- Name: Avatar_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."Avatar_id_seq" OWNED BY public."Avatar".id;


--
-- Name: ChatResponse; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."ChatResponse" (
    id integer NOT NULL,
    question text NOT NULL,
    "audioUrl" text NOT NULL,
    "voiceId" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."ChatResponse" OWNER TO postgres;

--
-- Name: ChatResponse_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."ChatResponse_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."ChatResponse_id_seq" OWNER TO postgres;

--
-- Name: ChatResponse_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."ChatResponse_id_seq" OWNED BY public."ChatResponse".id;


--
-- Name: Audio id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Audio" ALTER COLUMN id SET DEFAULT nextval('public."Audio_id_seq"'::regclass);


--
-- Name: Avatar id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Avatar" ALTER COLUMN id SET DEFAULT nextval('public."Avatar_id_seq"'::regclass);


--
-- Name: AvatarAnimation id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."AvatarAnimation" ALTER COLUMN id SET DEFAULT nextval('public."AvatarAnimation_id_seq"'::regclass);


--
-- Name: ChatResponse id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ChatResponse" ALTER COLUMN id SET DEFAULT nextval('public."ChatResponse_id_seq"'::regclass);


--
-- Data for Name: Audio; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Audio" (id, "clonedUrl", "createdAt", "originalUrl", status, "updatedAt", "voiceId") FROM stdin;
3	\N	2025-10-11 14:28:32.396	http://localhost:3000/uploads/file-1760192912363-910689182.mp3	completed	2025-10-11 14:28:36.388	h9B40LAKRwMJwGVe7qJk
4	\N	2025-10-13 08:43:54.018	http://localhost:3000/uploads/file-1760345034001-772990326.mp3	error	2025-10-13 08:44:00.245	\N
5	\N	2025-10-13 08:48:51.667	http://localhost:3000/uploads/file-1760345331657-667965744.mp3	error	2025-10-13 08:48:58.167	\N
6	\N	2025-10-13 08:59:12.575	http://localhost:3000/uploads/file-1760345952566-973000356.mp3	completed	2025-10-13 08:59:26.28	4u2xYZXib0fdZrxmD7Du
7	\N	2025-10-13 09:04:23.463	http://localhost:3000/uploads/file-1760346263449-280494502.mp3	deleted	2025-10-13 09:05:39.48	36JWD4RVHzHVjowZXFHO
8	\N	2025-10-13 13:14:21.071	http://localhost:3000/uploads/file-1760361261064-935826180.mp3	completed	2025-10-13 13:14:23.925	rGaYDEetpH3XnEm5bDHd
9	\N	2025-10-14 17:33:52.787	http://localhost:3000/uploads/file-1760463232751-675065273.mp3	completed	2025-10-14 17:34:01.297	v8oy1l7f8ejDhwvUsk66
10	\N	2025-10-15 07:51:11.061	http://localhost:3000/uploads/file-1760514671021-204462705.mp3	completed	2025-10-15 07:51:14.751	Aab6GB7Yz6ntsBgTkXhy
\.


--
-- Data for Name: Avatar; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Avatar" (id, name, "imageUrl", description, "createdAt", "updatedAt") FROM stdin;
1	Виталёк	http://localhost:3000/uploads/image-1760360880007-266755447.jpg	ну чисто я	2025-10-13 13:08:00.048	2025-10-13 13:08:00.048
2	Мой виртуальный двойник Виктор	http://localhost:3000/uploads/image-1760526218421-512436283.jpg	Аватар для презентаций аоаоа	2025-10-15 11:03:38.432	2025-10-15 11:03:38.432
3	Мой виртуальный двойник obama	http://localhost:3000/uploads/image-1760607355701-232111782.jpg	Аватар для презентаций obama	2025-10-16 09:35:55.725	2025-10-16 09:35:55.725
\.


--
-- Data for Name: AvatarAnimation; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."AvatarAnimation" (id, "avatarId", "audioUrl", "videoUrl", text, "voiceId", status, "createdAt", "updatedAt") FROM stdin;
14	2	http://localhost:3000/uploads/custom_1760529981537_zf53k3phe.mp3	http://localhost:3000/uploads/animated_14_1760529981570.mp4	Привет! Меня зовут Виктор, и я ваш виртуальный помощник. И ещё я бедолага	Aab6GB7Yz6ntsBgTkXhy	completed	2025-10-15 12:06:21.541	2025-10-15 12:06:54.67
15	2	http://localhost:3000/uploads/custom_1760530050652_igbfqcph3.mp3	http://localhost:3000/uploads/animated_15_1760530050662.mp4	Привет! Меня зовут Виктор, и я ваш виртуальный помощник. И ещё я бедолага	Aab6GB7Yz6ntsBgTkXhy	completed	2025-10-15 12:07:30.66	2025-10-15 12:08:01.605
4	1	http://localhost:3000/uploads/custom_1760464055105_6jdkqbjf7.mp3	http://localhost:3000/uploads/animated_4_1760464055148.mp4	Привет! Я бедолага Виталя, я бэкенд разработчик! Всего доброго	v8oy1l7f8ejDhwvUsk66	completed	2025-10-14 17:47:35.114	2025-10-14 17:47:37.063
5	1	http://localhost:3000/uploads/custom_1760514730044_u7h85vqex.mp3	http://localhost:3000/uploads/animated_5_1760514730107.mp4	Привет! Меня зовут Виктор Корнеплод, ббебебебебебе	Aab6GB7Yz6ntsBgTkXhy	completed	2025-10-15 07:52:10.093	2025-10-15 07:52:31.827
6	1	http://localhost:3000/uploads/custom_1760519924258_1cnb9jfbq.mp3	http://localhost:3000/uploads/animated_6_1760519924284.mp4	Привет! Меня зовут Виктор, и я ваш виртуальный помощник.	Aab6GB7Yz6ntsBgTkXhy	completed	2025-10-15 09:18:44.264	2025-10-15 09:19:30.327
7	1	http://localhost:3000/uploads/custom_1760520878745_00i2ucnuj.mp3	http://localhost:3000/uploads/animated_7_1760520878791.mp4	Привет! Меня зовут Виктор, и я ваш виртуальный помощник.	Aab6GB7Yz6ntsBgTkXhy	completed	2025-10-15 09:34:38.753	2025-10-15 09:35:10.911
8	1	http://localhost:3000/uploads/custom_1760521358410_xuqjxkttc.mp3	http://localhost:3000/uploads/animated_8_1760521358472.mp4	Привет! Меня зовут Виктор, и я ваш виртуальный помощник.	Aab6GB7Yz6ntsBgTkXhy	completed	2025-10-15 09:42:38.448	2025-10-15 09:43:27.915
9	1	http://localhost:3000/uploads/custom_1760521451974_mmdm4xsoh.mp3	http://localhost:3000/uploads/animated_9_1760521451987.mp4	Привет! Меня зовут Виктор, и я ваш виртуальный помощник.	Aab6GB7Yz6ntsBgTkXhy	completed	2025-10-15 09:44:11.979	2025-10-15 09:44:51.279
10	1	http://localhost:3000/uploads/custom_1760523867341_ptmudot65.mp3	http://localhost:3000/uploads/animated_10_1760523867374.mp4	Привет! Меня зовут Виктор, и я ваш виртуальный помощник.	Aab6GB7Yz6ntsBgTkXhy	completed	2025-10-15 10:24:27.348	2025-10-15 10:25:01.811
11	1	http://localhost:3000/uploads/custom_1760525718074_xsjgirqg2.mp3	http://localhost:3000/uploads/animated_11_1760525718428.mp4	Привет! Меня зовут Виктор, и я ваш виртуальный помощник.	Aab6GB7Yz6ntsBgTkXhy	completed	2025-10-15 10:55:18.088	2025-10-15 10:55:51.814
12	1	http://localhost:3000/uploads/custom_1760526118038_wuu9i9ll0.mp3	http://localhost:3000/uploads/animated_12_1760526118073.mp4	Привет! Меня зовут Виктор, и я ваш виртуальный помощник. Я бедолага	Aab6GB7Yz6ntsBgTkXhy	completed	2025-10-15 11:01:58.045	2025-10-15 11:02:39.9
13	2	http://localhost:3000/uploads/custom_1760526227519_meri2842h.mp3	http://localhost:3000/uploads/animated_13_1760526227526.mp4	Привет! Меня зовут Виктор, и я ваш виртуальный помощник. Я бедолага	Aab6GB7Yz6ntsBgTkXhy	completed	2025-10-15 11:03:47.524	2025-10-15 11:03:52.776
16	2	http://localhost:3000/uploads/custom_1760598947444_be49a962l.mp3	http://localhost:3000/uploads/animated_16_1760598947479.mp4	Привет! Меня зовут Виктор, и я ваш виртуальный помощник. Всего хорошего, чикибамбони, я люблю шашлык	Aab6GB7Yz6ntsBgTkXhy	completed	2025-10-16 07:15:47.45	2025-10-16 07:15:52.439
17	3	http://localhost:3000/uploads/custom_1760607405650_7bfplriqs.mp3	http://localhost:3000/uploads/animated_17_1760607405662.mp4	Привет! Я барак обама, щас бы двухсотграмовый стакан взять и курт курт курт курт, туда сюда джиги джага	Aab6GB7Yz6ntsBgTkXhy	completed	2025-10-16 09:36:45.657	2025-10-16 09:41:48.234
18	3	http://localhost:3000/uploads/custom_1760608054220_llco6onf3.mp3		Привет! Меня зовут Виктор, и я ваш виртуальный помощник. Привет! Меня зовут Виктор, и я ваш виртуальный помощник. Привет! Меня зовут Виктор, и я ваш виртуальный помощник.	Aab6GB7Yz6ntsBgTkXhy	processing	2025-10-16 09:47:34.223	2025-10-16 09:47:34.223
19	3	http://localhost:3000/uploads/custom_1760609534162_qv3mb7d5o.mp3		Привет! Меня зовут Виктор, и я ваш виртуальный помощник. Привет! Меня зовут Виктор, и я ваш виртуальный помощник. Привет! Меня зовут Виктор, и я ваш виртуальный помощник.	Aab6GB7Yz6ntsBgTkXhy	error	2025-10-16 10:12:14.167	2025-10-16 10:17:15.727
20	3	http://localhost:3000/uploads/custom_1760610508092_pratud2cu.mp3		Привет! Меня зовут Виктор, и я ваш виртуальный помощник. Привет! Меня зовут Виктор, и я ваш виртуальный помощник. Привет! Меня зовут Виктор, и я ваш виртуальный помощник.	Aab6GB7Yz6ntsBgTkXhy	error	2025-10-16 10:28:28.1	2025-10-16 10:33:28.979
\.


--
-- Data for Name: ChatResponse; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."ChatResponse" (id, question, "audioUrl", "voiceId", "createdAt") FROM stdin;
1	Как дела?	http://localhost:3000/uploads/response_1760192920768_2zxr3ikb8.mp3	h9B40LAKRwMJwGVe7qJk	2025-10-11 14:28:40.821
2	Расскажи историю	http://localhost:3000/uploads/response_1760192923401_dwx2j3xb2.mp3	h9B40LAKRwMJwGVe7qJk	2025-10-11 14:28:43.405
3	Что делаешь?	http://localhost:3000/uploads/response_1760192925944_lomdfx2t0.mp3	h9B40LAKRwMJwGVe7qJk	2025-10-11 14:28:45.946
4	Как настроение?	http://localhost:3000/uploads/response_1760192927676_49ek7rp04.mp3	h9B40LAKRwMJwGVe7qJk	2025-10-11 14:28:47.678
5	Расскажи анекдот	http://localhost:3000/uploads/response_1760192930313_kbl0ska3h.mp3	h9B40LAKRwMJwGVe7qJk	2025-10-11 14:28:50.319
6	Как дела?	http://localhost:3000/uploads/response_1760345969285_kwxd3vkya.mp3	4u2xYZXib0fdZrxmD7Du	2025-10-13 08:59:29.288
7	Расскажи историю	http://localhost:3000/uploads/response_1760345974546_7qd4d4j98.mp3	4u2xYZXib0fdZrxmD7Du	2025-10-13 08:59:34.551
8	Что делаешь?	http://localhost:3000/uploads/response_1760345977776_0b7wq48tb.mp3	4u2xYZXib0fdZrxmD7Du	2025-10-13 08:59:37.778
9	Как настроение?	http://localhost:3000/uploads/response_1760345981275_zzu9ixkia.mp3	4u2xYZXib0fdZrxmD7Du	2025-10-13 08:59:41.277
10	Расскажи анекдот	http://localhost:3000/uploads/response_1760345987074_0to861aa6.mp3	4u2xYZXib0fdZrxmD7Du	2025-10-13 08:59:47.077
11	Как дела?	http://localhost:3000/uploads/response_1760346270233_clz2epvg7.mp3	36JWD4RVHzHVjowZXFHO	2025-10-13 09:04:30.235
12	Расскажи историю	http://localhost:3000/uploads/response_1760346274441_njnbz4s4u.mp3	36JWD4RVHzHVjowZXFHO	2025-10-13 09:04:34.443
13	Что делаешь?	http://localhost:3000/uploads/response_1760346277163_zjy14tq9f.mp3	36JWD4RVHzHVjowZXFHO	2025-10-13 09:04:37.166
14	Как настроение?	http://localhost:3000/uploads/response_1760346280454_p9hb715p0.mp3	36JWD4RVHzHVjowZXFHO	2025-10-13 09:04:40.457
15	Расскажи анекдот	http://localhost:3000/uploads/response_1760346284781_e6rwuk5c9.mp3	36JWD4RVHzHVjowZXFHO	2025-10-13 09:04:44.784
16	Как дела?	http://localhost:3000/uploads/response_1760463245975_l91tqfohh.mp3	v8oy1l7f8ejDhwvUsk66	2025-10-14 17:34:05.979
17	Расскажи историю	http://localhost:3000/uploads/response_1760463251273_8ufinw8j5.mp3	v8oy1l7f8ejDhwvUsk66	2025-10-14 17:34:11.276
18	Что делаешь?	http://localhost:3000/uploads/response_1760463254727_m0quf555o.mp3	v8oy1l7f8ejDhwvUsk66	2025-10-14 17:34:14.732
19	Как настроение?	http://localhost:3000/uploads/response_1760463257991_e5fcljgbw.mp3	v8oy1l7f8ejDhwvUsk66	2025-10-14 17:34:17.994
20	Расскажи анекдот	http://localhost:3000/uploads/response_1760463263429_95w9yp3so.mp3	v8oy1l7f8ejDhwvUsk66	2025-10-14 17:34:23.435
21	Как дела?	http://localhost:3000/uploads/response_1760514678174_9e6c1xv7c.mp3	Aab6GB7Yz6ntsBgTkXhy	2025-10-15 07:51:18.222
22	Расскажи историю	http://localhost:3000/uploads/response_1760514683051_g70lezh22.mp3	Aab6GB7Yz6ntsBgTkXhy	2025-10-15 07:51:23.056
23	Что делаешь?	http://localhost:3000/uploads/response_1760514686005_xsdjk9j6f.mp3	Aab6GB7Yz6ntsBgTkXhy	2025-10-15 07:51:26.01
24	Как настроение?	http://localhost:3000/uploads/response_1760514689585_v0ofcsy4v.mp3	Aab6GB7Yz6ntsBgTkXhy	2025-10-15 07:51:29.636
25	Расскажи анекдот	http://localhost:3000/uploads/response_1760514695048_ujpm9sazc.mp3	Aab6GB7Yz6ntsBgTkXhy	2025-10-15 07:51:35.052
\.


--
-- Name: Audio_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Audio_id_seq"', 10, true);


--
-- Name: AvatarAnimation_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."AvatarAnimation_id_seq"', 20, true);


--
-- Name: Avatar_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Avatar_id_seq"', 3, true);


--
-- Name: ChatResponse_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."ChatResponse_id_seq"', 25, true);


--
-- Name: Audio Audio_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Audio"
    ADD CONSTRAINT "Audio_pkey" PRIMARY KEY (id);


--
-- Name: AvatarAnimation AvatarAnimation_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."AvatarAnimation"
    ADD CONSTRAINT "AvatarAnimation_pkey" PRIMARY KEY (id);


--
-- Name: Avatar Avatar_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Avatar"
    ADD CONSTRAINT "Avatar_pkey" PRIMARY KEY (id);


--
-- Name: ChatResponse ChatResponse_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ChatResponse"
    ADD CONSTRAINT "ChatResponse_pkey" PRIMARY KEY (id);


--
-- Name: AvatarAnimation AvatarAnimation_avatarId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."AvatarAnimation"
    ADD CONSTRAINT "AvatarAnimation_avatarId_fkey" FOREIGN KEY ("avatarId") REFERENCES public."Avatar"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--


