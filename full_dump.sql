SET session_replication_role = replica;

--
-- PostgreSQL database dump
--

-- Dumped from database version 17.4
-- Dumped by pg_dump version 17.4

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Data for Name: achievement_definitions; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: achievement_progress; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: teams; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: team_players; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: achievements; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: calendar_events; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: equipment; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: game_plans; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: game_plan_situations; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: playbooks; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: plays; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: game_plan_plays; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: game_results; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: helmet_stickers; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: play_calls; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: team_posts; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: post_comments; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: post_likes; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: post_shares; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: practice_schedules; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: practice_attendance; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: practice_scripts; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: practice_templates; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: profiles; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."profiles" ("id", "full_name", "avatar_url", "role", "bio", "phone", "email", "display_name", "address", "settings", "position", "jersey_number", "emergency_contact", "emergency_phone", "grade_level", "height_inches", "weight_lbs", "is_active", "notification_preferences", "last_login", "created_at", "updated_at") VALUES
	('fafcaafd-0154-4f87-9752-95fbfa2372a0', 'Justin DePierro', NULL, 'player', NULL, NULL, 'justindepierro@gmail.com', 'Justin', NULL, '{}', NULL, NULL, NULL, NULL, NULL, NULL, NULL, true, '{"push": true, "email": true, "social": true}', NULL, '2025-09-28 01:29:06.72325+00', '2025-09-28 01:29:06.72325+00');


--
-- Data for Name: team_events; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: team_members; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- PostgreSQL database dump complete
--

RESET ALL;

