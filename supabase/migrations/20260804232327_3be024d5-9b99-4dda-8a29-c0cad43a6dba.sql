
-- ============ TEAM ============
CREATE TABLE public.team_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  email text NOT NULL,
  avatar_initials text,
  department text NOT NULL DEFAULT 'support',
  role_title text NOT NULL DEFAULT 'Agent',
  status text NOT NULL DEFAULT 'online',
  shift text NOT NULL DEFAULT 'day',
  tickets_handled integer NOT NULL DEFAULT 0,
  leads_handled integer NOT NULL DEFAULT 0,
  csat numeric(4,2) NOT NULL DEFAULT 0,
  avg_response_minutes integer NOT NULL DEFAULT 0,
  target_amount numeric(14,2) NOT NULL DEFAULT 0,
  achieved_amount numeric(14,2) NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.team_members TO authenticated;
GRANT ALL ON public.team_members TO service_role;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "read team_members" ON public.team_members FOR SELECT TO authenticated USING (true);
CREATE POLICY "staff write team_members" ON public.team_members FOR ALL TO authenticated USING (public.is_support_staff(auth.uid())) WITH CHECK (public.is_support_staff(auth.uid()));

-- ============ CUSTOMERS ============
CREATE TABLE public.crm_customers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name text NOT NULL,
  contact_name text NOT NULL,
  email text NOT NULL,
  phone text,
  industry text,
  country text,
  plan text NOT NULL DEFAULT 'starter',
  status text NOT NULL DEFAULT 'active',
  health_score integer NOT NULL DEFAULT 80,
  lifetime_value numeric(14,2) NOT NULL DEFAULT 0,
  open_tickets integer NOT NULL DEFAULT 0,
  owner_id uuid REFERENCES public.team_members(id) ON DELETE SET NULL,
  last_contact_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.crm_customers TO authenticated;
GRANT ALL ON public.crm_customers TO service_role;
ALTER TABLE public.crm_customers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "read crm_customers" ON public.crm_customers FOR SELECT TO authenticated USING (true);
CREATE POLICY "staff write crm_customers" ON public.crm_customers FOR ALL TO authenticated USING (public.is_support_staff(auth.uid())) WITH CHECK (public.is_support_staff(auth.uid()));

-- ============ LEADS ============
CREATE TABLE public.sales_leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reference text NOT NULL UNIQUE,
  company text NOT NULL,
  contact_name text NOT NULL,
  email text,
  phone text,
  category text,
  source text NOT NULL DEFAULT 'website',
  urgency text NOT NULL DEFAULT 'warm',
  stage text NOT NULL DEFAULT 'new',
  value numeric(14,2) NOT NULL DEFAULT 0,
  ai_win_probability integer NOT NULL DEFAULT 50,
  qualified boolean NOT NULL DEFAULT false,
  assigned_to uuid REFERENCES public.team_members(id) ON DELETE SET NULL,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.sales_leads TO authenticated;
GRANT ALL ON public.sales_leads TO service_role;
ALTER TABLE public.sales_leads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "read sales_leads" ON public.sales_leads FOR SELECT TO authenticated USING (true);
CREATE POLICY "staff write sales_leads" ON public.sales_leads FOR ALL TO authenticated USING (public.is_support_staff(auth.uid())) WITH CHECK (public.is_support_staff(auth.uid()));

-- ============ DEALS ============
CREATE TABLE public.sales_deals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reference text NOT NULL UNIQUE,
  title text NOT NULL,
  lead_id uuid REFERENCES public.sales_leads(id) ON DELETE SET NULL,
  customer_id uuid REFERENCES public.crm_customers(id) ON DELETE SET NULL,
  stage text NOT NULL DEFAULT 'discovery',
  value numeric(14,2) NOT NULL DEFAULT 0,
  probability integer NOT NULL DEFAULT 50,
  owner_id uuid REFERENCES public.team_members(id) ON DELETE SET NULL,
  expected_close_date date,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.sales_deals TO authenticated;
GRANT ALL ON public.sales_deals TO service_role;
ALTER TABLE public.sales_deals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "read sales_deals" ON public.sales_deals FOR SELECT TO authenticated USING (true);
CREATE POLICY "staff write sales_deals" ON public.sales_deals FOR ALL TO authenticated USING (public.is_support_staff(auth.uid())) WITH CHECK (public.is_support_staff(auth.uid()));

-- ============ TASKS ============
CREATE TABLE public.crm_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  task_type text NOT NULL DEFAULT 'follow_up',
  priority text NOT NULL DEFAULT 'medium',
  status text NOT NULL DEFAULT 'pending',
  due_at timestamptz,
  owner_id uuid REFERENCES public.team_members(id) ON DELETE SET NULL,
  customer_id uuid REFERENCES public.crm_customers(id) ON DELETE CASCADE,
  lead_id uuid REFERENCES public.sales_leads(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.crm_tasks TO authenticated;
GRANT ALL ON public.crm_tasks TO service_role;
ALTER TABLE public.crm_tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "read crm_tasks" ON public.crm_tasks FOR SELECT TO authenticated USING (true);
CREATE POLICY "staff write crm_tasks" ON public.crm_tasks FOR ALL TO authenticated USING (public.is_support_staff(auth.uid())) WITH CHECK (public.is_support_staff(auth.uid()));

-- ============ COMMISSIONS ============
CREATE TABLE public.sales_commissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id uuid REFERENCES public.team_members(id) ON DELETE CASCADE,
  period text NOT NULL,
  deals_closed integer NOT NULL DEFAULT 0,
  revenue numeric(14,2) NOT NULL DEFAULT 0,
  commission_rate numeric(5,2) NOT NULL DEFAULT 5,
  earned numeric(14,2) NOT NULL DEFAULT 0,
  paid numeric(14,2) NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.sales_commissions TO authenticated;
GRANT ALL ON public.sales_commissions TO service_role;
ALTER TABLE public.sales_commissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "read sales_commissions" ON public.sales_commissions FOR SELECT TO authenticated USING (true);
CREATE POLICY "staff write sales_commissions" ON public.sales_commissions FOR ALL TO authenticated USING (public.is_support_staff(auth.uid())) WITH CHECK (public.is_support_staff(auth.uid()));

-- ============ TICKETS ============
CREATE TABLE public.support_tickets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reference text NOT NULL UNIQUE,
  subject text NOT NULL,
  description text,
  customer_id uuid REFERENCES public.crm_customers(id) ON DELETE SET NULL,
  customer_name text NOT NULL,
  channel text NOT NULL DEFAULT 'email',
  category text NOT NULL DEFAULT 'general',
  priority text NOT NULL DEFAULT 'medium',
  status text NOT NULL DEFAULT 'new',
  assigned_to uuid REFERENCES public.team_members(id) ON DELETE SET NULL,
  sla_minutes_remaining integer NOT NULL DEFAULT 120,
  sla_breached boolean NOT NULL DEFAULT false,
  first_response_at timestamptz,
  resolved_at timestamptz,
  csat integer,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.support_tickets TO authenticated;
GRANT ALL ON public.support_tickets TO service_role;
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "read support_tickets" ON public.support_tickets FOR SELECT TO authenticated USING (true);
CREATE POLICY "staff write support_tickets" ON public.support_tickets FOR ALL TO authenticated USING (public.is_support_staff(auth.uid())) WITH CHECK (public.is_support_staff(auth.uid()));

-- ============ ESCALATIONS ============
CREATE TABLE public.support_escalations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id uuid REFERENCES public.support_tickets(id) ON DELETE CASCADE,
  reference text NOT NULL,
  reason text NOT NULL,
  level integer NOT NULL DEFAULT 1,
  status text NOT NULL DEFAULT 'open',
  raised_by uuid REFERENCES public.team_members(id) ON DELETE SET NULL,
  assigned_to uuid REFERENCES public.team_members(id) ON DELETE SET NULL,
  resolution_notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.support_escalations TO authenticated;
GRANT ALL ON public.support_escalations TO service_role;
ALTER TABLE public.support_escalations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "read support_escalations" ON public.support_escalations FOR SELECT TO authenticated USING (true);
CREATE POLICY "staff write support_escalations" ON public.support_escalations FOR ALL TO authenticated USING (public.is_support_staff(auth.uid())) WITH CHECK (public.is_support_staff(auth.uid()));

-- ============ CALLS ============
CREATE TABLE public.call_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  direction text NOT NULL DEFAULT 'inbound',
  caller_name text NOT NULL,
  phone text NOT NULL,
  customer_id uuid REFERENCES public.crm_customers(id) ON DELETE SET NULL,
  agent_id uuid REFERENCES public.team_members(id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'completed',
  duration_seconds integer NOT NULL DEFAULT 0,
  wait_seconds integer NOT NULL DEFAULT 0,
  notes text,
  started_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.call_logs TO authenticated;
GRANT ALL ON public.call_logs TO service_role;
ALTER TABLE public.call_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "read call_logs" ON public.call_logs FOR SELECT TO authenticated USING (true);
CREATE POLICY "staff write call_logs" ON public.call_logs FOR ALL TO authenticated USING (public.is_support_staff(auth.uid())) WITH CHECK (public.is_support_staff(auth.uid()));

-- ============ EMAIL QUEUE ============
CREATE TABLE public.email_queue (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subject text NOT NULL,
  from_email text NOT NULL,
  from_name text,
  preview text,
  category text NOT NULL DEFAULT 'support',
  priority text NOT NULL DEFAULT 'medium',
  status text NOT NULL DEFAULT 'unread',
  assigned_to uuid REFERENCES public.team_members(id) ON DELETE SET NULL,
  received_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.email_queue TO authenticated;
GRANT ALL ON public.email_queue TO service_role;
ALTER TABLE public.email_queue ENABLE ROW LEVEL SECURITY;
CREATE POLICY "read email_queue" ON public.email_queue FOR SELECT TO authenticated USING (true);
CREATE POLICY "staff write email_queue" ON public.email_queue FOR ALL TO authenticated USING (public.is_support_staff(auth.uid())) WITH CHECK (public.is_support_staff(auth.uid()));

-- ============ CHAT ============
CREATE TABLE public.chat_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  visitor_name text NOT NULL,
  visitor_email text,
  channel text NOT NULL DEFAULT 'web',
  language text NOT NULL DEFAULT 'en',
  status text NOT NULL DEFAULT 'active',
  handled_by text NOT NULL DEFAULT 'bot',
  agent_id uuid REFERENCES public.team_members(id) ON DELETE SET NULL,
  sentiment text NOT NULL DEFAULT 'neutral',
  unread_count integer NOT NULL DEFAULT 0,
  started_at timestamptz NOT NULL DEFAULT now(),
  ended_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.chat_sessions TO authenticated;
GRANT ALL ON public.chat_sessions TO service_role;
ALTER TABLE public.chat_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "read chat_sessions" ON public.chat_sessions FOR SELECT TO authenticated USING (true);
CREATE POLICY "staff write chat_sessions" ON public.chat_sessions FOR ALL TO authenticated USING (public.is_support_staff(auth.uid())) WITH CHECK (public.is_support_staff(auth.uid()));

CREATE TABLE public.chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES public.chat_sessions(id) ON DELETE CASCADE,
  sender_type text NOT NULL DEFAULT 'visitor',
  sender_name text,
  body text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.chat_messages TO authenticated;
GRANT ALL ON public.chat_messages TO service_role;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "read chat_messages" ON public.chat_messages FOR SELECT TO authenticated USING (true);
CREATE POLICY "staff write chat_messages" ON public.chat_messages FOR ALL TO authenticated USING (public.is_support_staff(auth.uid())) WITH CHECK (public.is_support_staff(auth.uid()));

-- ============ CHATBOTS ============
CREATE TABLE public.chatbots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  purpose text,
  channel text NOT NULL DEFAULT 'web',
  status text NOT NULL DEFAULT 'active',
  language text NOT NULL DEFAULT 'en',
  conversations integer NOT NULL DEFAULT 0,
  resolution_rate numeric(5,2) NOT NULL DEFAULT 0,
  escalation_rate numeric(5,2) NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.chatbots TO authenticated;
GRANT ALL ON public.chatbots TO service_role;
ALTER TABLE public.chatbots ENABLE ROW LEVEL SECURITY;
CREATE POLICY "read chatbots" ON public.chatbots FOR SELECT TO authenticated USING (true);
CREATE POLICY "staff write chatbots" ON public.chatbots FOR ALL TO authenticated USING (public.is_support_staff(auth.uid())) WITH CHECK (public.is_support_staff(auth.uid()));

CREATE TABLE public.bot_training_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bot_id uuid REFERENCES public.chatbots(id) ON DELETE CASCADE,
  title text NOT NULL,
  source_type text NOT NULL DEFAULT 'document',
  status text NOT NULL DEFAULT 'trained',
  chunks integer NOT NULL DEFAULT 0,
  accuracy numeric(5,2) NOT NULL DEFAULT 0,
  last_trained_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.bot_training_documents TO authenticated;
GRANT ALL ON public.bot_training_documents TO service_role;
ALTER TABLE public.bot_training_documents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "read bot_training_documents" ON public.bot_training_documents FOR SELECT TO authenticated USING (true);
CREATE POLICY "staff write bot_training_documents" ON public.bot_training_documents FOR ALL TO authenticated USING (public.is_support_staff(auth.uid())) WITH CHECK (public.is_support_staff(auth.uid()));

CREATE TABLE public.automation_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  scope text NOT NULL DEFAULT 'support',
  trigger_event text NOT NULL,
  condition_text text,
  action_text text NOT NULL,
  is_enabled boolean NOT NULL DEFAULT true,
  runs_count integer NOT NULL DEFAULT 0,
  last_run_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.automation_rules TO authenticated;
GRANT ALL ON public.automation_rules TO service_role;
ALTER TABLE public.automation_rules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "read automation_rules" ON public.automation_rules FOR SELECT TO authenticated USING (true);
CREATE POLICY "staff write automation_rules" ON public.automation_rules FOR ALL TO authenticated USING (public.is_support_staff(auth.uid())) WITH CHECK (public.is_support_staff(auth.uid()));

CREATE TABLE public.bot_conversation_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bot_id uuid REFERENCES public.chatbots(id) ON DELETE CASCADE,
  session_id uuid REFERENCES public.chat_sessions(id) ON DELETE SET NULL,
  intent text,
  confidence numeric(5,2),
  outcome text NOT NULL DEFAULT 'resolved',
  language text NOT NULL DEFAULT 'en',
  message_count integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.bot_conversation_logs TO authenticated;
GRANT ALL ON public.bot_conversation_logs TO service_role;
ALTER TABLE public.bot_conversation_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "read bot_conversation_logs" ON public.bot_conversation_logs FOR SELECT TO authenticated USING (true);
CREATE POLICY "staff write bot_conversation_logs" ON public.bot_conversation_logs FOR ALL TO authenticated USING (public.is_support_staff(auth.uid())) WITH CHECK (public.is_support_staff(auth.uid()));

CREATE TABLE public.bot_languages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  name text NOT NULL,
  is_enabled boolean NOT NULL DEFAULT true,
  coverage numeric(5,2) NOT NULL DEFAULT 0,
  conversations integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.bot_languages TO authenticated;
GRANT ALL ON public.bot_languages TO service_role;
ALTER TABLE public.bot_languages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "read bot_languages" ON public.bot_languages FOR SELECT TO authenticated USING (true);
CREATE POLICY "staff write bot_languages" ON public.bot_languages FOR ALL TO authenticated USING (public.is_support_staff(auth.uid())) WITH CHECK (public.is_support_staff(auth.uid()));

-- ============ KNOWLEDGE ============
CREATE TABLE public.canned_responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  category text NOT NULL DEFAULT 'general',
  body text NOT NULL,
  shortcut text,
  usage_count integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.canned_responses TO authenticated;
GRANT ALL ON public.canned_responses TO service_role;
ALTER TABLE public.canned_responses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "read canned_responses" ON public.canned_responses FOR SELECT TO authenticated USING (true);
CREATE POLICY "staff write canned_responses" ON public.canned_responses FOR ALL TO authenticated USING (public.is_support_staff(auth.uid())) WITH CHECK (public.is_support_staff(auth.uid()));

CREATE TABLE public.wiki_articles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  category text NOT NULL DEFAULT 'general',
  summary text,
  body text,
  views integer NOT NULL DEFAULT 0,
  helpful_count integer NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'published',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.wiki_articles TO authenticated;
GRANT ALL ON public.wiki_articles TO service_role;
ALTER TABLE public.wiki_articles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "read wiki_articles" ON public.wiki_articles FOR SELECT TO authenticated USING (true);
CREATE POLICY "staff write wiki_articles" ON public.wiki_articles FOR ALL TO authenticated USING (public.is_support_staff(auth.uid())) WITH CHECK (public.is_support_staff(auth.uid()));

-- ============ updated_at triggers ============
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_team_members_updated BEFORE UPDATE ON public.team_members FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_crm_customers_updated BEFORE UPDATE ON public.crm_customers FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_sales_leads_updated BEFORE UPDATE ON public.sales_leads FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_sales_deals_updated BEFORE UPDATE ON public.sales_deals FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_crm_tasks_updated BEFORE UPDATE ON public.crm_tasks FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_sales_commissions_updated BEFORE UPDATE ON public.sales_commissions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_support_tickets_updated BEFORE UPDATE ON public.support_tickets FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_support_escalations_updated BEFORE UPDATE ON public.support_escalations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_chatbots_updated BEFORE UPDATE ON public.chatbots FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_automation_rules_updated BEFORE UPDATE ON public.automation_rules FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_canned_responses_updated BEFORE UPDATE ON public.canned_responses FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_wiki_articles_updated BEFORE UPDATE ON public.wiki_articles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ SEED ============
INSERT INTO public.team_members (id, full_name, email, avatar_initials, department, role_title, status, shift, tickets_handled, leads_handled, csat, avg_response_minutes, target_amount, achieved_amount) VALUES
 ('11111111-1111-4111-8111-000000000001','Sarah Chen','sarah.chen@softwarevala.com','SC','support','Senior Support Engineer','online','day',412,0,4.80,6,0,0),
 ('11111111-1111-4111-8111-000000000002','Mike Johnson','mike.johnson@softwarevala.com','MJ','support','Support Engineer','online','day',357,0,4.60,9,0,0),
 ('11111111-1111-4111-8111-000000000003','Lisa Park','lisa.park@softwarevala.com','LP','support','Support Specialist','away','evening',298,0,4.40,12,0,0),
 ('11111111-1111-4111-8111-000000000004','Emma Davis','emma.davis@softwarevala.com','ED','support','Escalation Lead','online','night',186,0,4.90,5,0,0),
 ('11111111-1111-4111-8111-000000000005','James Wilson','james.wilson@softwarevala.com','JW','support','Support Engineer','offline','night',221,0,4.30,14,0,0),
 ('11111111-1111-4111-8111-000000000006','Alex Thompson','alex.thompson@softwarevala.com','AT','sales','Senior Account Executive','online','day',0,164,4.70,11,120000,98400),
 ('11111111-1111-4111-8111-000000000007','Maria Garcia','maria.garcia@softwarevala.com','MG','sales','Account Executive','online','day',0,142,4.50,15,100000,87250),
 ('11111111-1111-4111-8111-000000000008','David Kim','david.kim@softwarevala.com','DK','sales','Sales Development Rep','away','day',0,203,4.20,18,80000,61300),
 ('11111111-1111-4111-8111-000000000009','Priya Nair','priya.nair@softwarevala.com','PN','sales','Account Executive','online','evening',0,131,4.60,13,100000,104900),
 ('11111111-1111-4111-8111-000000000010','Omar Haddad','omar.haddad@softwarevala.com','OH','management','Sales & Support Manager','online','day',64,58,4.80,7,300000,251850);

INSERT INTO public.crm_customers (id, company_name, contact_name, email, phone, industry, country, plan, status, health_score, lifetime_value, open_tickets, owner_id, last_contact_at) VALUES
 ('22222222-2222-4222-8222-000000000001','Tech Solutions Ltd','John Davidson','john@techsolutions.com','+1 415 555 0142','Technology','United States','enterprise','active',88,148500,2,'11111111-1111-4111-8111-000000000006', now() - interval '2 days'),
 ('22222222-2222-4222-8222-000000000002','Healthcare Plus','Maria Santos','maria@healthcareplus.com','+1 617 555 0198','Healthcare','United States','enterprise','active',72,212300,1,'11111111-1111-4111-8111-000000000007', now() - interval '5 hours'),
 ('22222222-2222-4222-8222-000000000003','EduLearn Academy','Robert Keller','robert@edulearn.edu','+44 20 7946 0321','Education','United Kingdom','growth','active',65,64200,1,'11111111-1111-4111-8111-000000000009', now() - interval '1 day'),
 ('22222222-2222-4222-8222-000000000004','Retail Mart','Lisa Pereira','lisa@retailmart.com','+91 22 4890 1123','Retail','India','starter','at_risk',41,18700,3,'11111111-1111-4111-8111-000000000008', now() - interval '9 days'),
 ('22222222-2222-4222-8222-000000000005','Global Logistics','James Turner','james@globallogistics.com','+971 4 555 0177','Logistics','United Arab Emirates','growth','active',79,96400,1,'11111111-1111-4111-8111-000000000006', now() - interval '3 days'),
 ('22222222-2222-4222-8222-000000000006','Northwind Manufacturing','Anna Kowalski','anna@northwindmfg.com','+49 30 5557 0044','Manufacturing','Germany','enterprise','active',91,187900,0,'11111111-1111-4111-8111-000000000009', now() - interval '12 hours'),
 ('22222222-2222-4222-8222-000000000007','Bluepeak Hospitality','Chen Wei','chen@bluepeak.hk','+852 3555 0190','Hospitality','Hong Kong','starter','churn_risk',38,9400,2,'11111111-1111-4111-8111-000000000007', now() - interval '21 days');

INSERT INTO public.sales_leads (reference, company, contact_name, email, phone, category, source, urgency, stage, value, ai_win_probability, qualified, assigned_to, created_at) VALUES
 ('LD-001','Tech Solutions Ltd','John Davidson','john@techsolutions.com','+1 415 555 0142','POS System','website','hot','proposal',25000,78,true,'11111111-1111-4111-8111-000000000006', now() - interval '2 days'),
 ('LD-002','Healthcare Plus','Maria Santos','maria@healthcareplus.com','+1 617 555 0198','Hospital Management','referral','hot','qualified',45000,71,true,'11111111-1111-4111-8111-000000000007', now() - interval '15 minutes'),
 ('LD-003','EduLearn Academy','Robert Keller','robert@edulearn.edu','+44 20 7946 0321','School ERP','demo_request','hot','contacted',18500,54,false,'11111111-1111-4111-8111-000000000008', now() - interval '25 minutes'),
 ('LD-004','Retail Mart','Lisa Pereira','lisa@retailmart.com','+91 22 4890 1123','Inventory','seo','cold','new',7200,29,false,NULL, now() - interval '1 hour'),
 ('LD-005','Global Logistics','James Turner','james@globallogistics.com','+971 4 555 0177','Fleet Management','influencer','warm','qualified',33000,63,true,'11111111-1111-4111-8111-000000000009', now() - interval '2 hours'),
 ('LD-006','Northwind Manufacturing','Anna Kowalski','anna@northwindmfg.com','+49 30 5557 0044','Manufacturing ERP','partner','warm','proposal',88000,69,true,'11111111-1111-4111-8111-000000000006', now() - interval '4 days'),
 ('LD-007','Bluepeak Hospitality','Chen Wei','chen@bluepeak.hk','+852 3555 0190','Hotel PMS','website','cold','new',12400,31,false,NULL, now() - interval '6 hours'),
 ('LD-008','Meridian Clinics','Sofia Rossi','sofia@meridianclinics.it','+39 06 5550 0231','Clinic Suite','event','hot','won',52000,100,true,'11111111-1111-4111-8111-000000000007', now() - interval '11 days'),
 ('LD-009','Cedar Financial','Peter Osei','peter@cedarfin.co','+234 1 555 0100','Loan Management','cold_call','warm','contacted',27500,44,false,'11111111-1111-4111-8111-000000000008', now() - interval '3 days'),
 ('LD-010','Vertex Studios','Hana Sato','hana@vertexstudios.jp','+81 3 5555 0117','Creative CRM','referral','cold','lost',9800,0,false,'11111111-1111-4111-8111-000000000009', now() - interval '18 days');

INSERT INTO public.sales_deals (reference, title, lead_id, customer_id, stage, value, probability, owner_id, expected_close_date) VALUES
 ('DL-001','Tech Solutions — POS rollout',(SELECT id FROM public.sales_leads WHERE reference='LD-001'),'22222222-2222-4222-8222-000000000001','proposal',25000,78,'11111111-1111-4111-8111-000000000006', current_date + 14),
 ('DL-002','Healthcare Plus — HMS enterprise',(SELECT id FROM public.sales_leads WHERE reference='LD-002'),'22222222-2222-4222-8222-000000000002','negotiation',45000,71,'11111111-1111-4111-8111-000000000007', current_date + 21),
 ('DL-003','Northwind — ERP migration',(SELECT id FROM public.sales_leads WHERE reference='LD-006'),'22222222-2222-4222-8222-000000000006','proposal',88000,69,'11111111-1111-4111-8111-000000000006', current_date + 35),
 ('DL-004','Global Logistics — Fleet add-on',(SELECT id FROM public.sales_leads WHERE reference='LD-005'),'22222222-2222-4222-8222-000000000005','discovery',33000,52,'11111111-1111-4111-8111-000000000009', current_date + 45),
 ('DL-005','Meridian Clinics — Clinic Suite',(SELECT id FROM public.sales_leads WHERE reference='LD-008'),NULL,'won',52000,100,'11111111-1111-4111-8111-000000000007', current_date - 4),
 ('DL-006','EduLearn — School ERP pilot',(SELECT id FROM public.sales_leads WHERE reference='LD-003'),'22222222-2222-4222-8222-000000000003','discovery',18500,48,'11111111-1111-4111-8111-000000000008', current_date + 28);

INSERT INTO public.crm_tasks (title, description, task_type, priority, status, due_at, owner_id, customer_id) VALUES
 ('Send revised POS proposal','Include multi-site pricing tier','proposal','high','pending', now() + interval '4 hours','11111111-1111-4111-8111-000000000006','22222222-2222-4222-8222-000000000001'),
 ('Follow up on HMS security review','Security questionnaire pending from IT','follow_up','high','in_progress', now() + interval '1 day','11111111-1111-4111-8111-000000000007','22222222-2222-4222-8222-000000000002'),
 ('Quarterly business review','Prepare usage and ROI deck','meeting','medium','pending', now() + interval '6 days','11111111-1111-4111-8111-000000000009','22222222-2222-4222-8222-000000000006'),
 ('Retention call — Retail Mart','Health score dropped to 41','call','critical','pending', now() + interval '2 hours','11111111-1111-4111-8111-000000000008','22222222-2222-4222-8222-000000000004'),
 ('Renewal reminder — Bluepeak','Contract expires in 30 days','follow_up','medium','pending', now() + interval '3 days','11111111-1111-4111-8111-000000000007','22222222-2222-4222-8222-000000000007'),
 ('Onboarding check-in','Week two adoption review','meeting','low','completed', now() - interval '2 days','11111111-1111-4111-8111-000000000006','22222222-2222-4222-8222-000000000005');

INSERT INTO public.sales_commissions (member_id, period, deals_closed, revenue, commission_rate, earned, paid, status) VALUES
 ('11111111-1111-4111-8111-000000000006','2026-07',6,98400,6.00,5904,5904,'paid'),
 ('11111111-1111-4111-8111-000000000007','2026-07',5,87250,6.00,5235,5235,'paid'),
 ('11111111-1111-4111-8111-000000000008','2026-07',4,61300,5.00,3065,0,'pending'),
 ('11111111-1111-4111-8111-000000000009','2026-07',7,104900,6.50,6818.50,0,'approved'),
 ('11111111-1111-4111-8111-000000000006','2026-08',2,31200,6.00,1872,0,'pending'),
 ('11111111-1111-4111-8111-000000000009','2026-08',3,44800,6.50,2912,0,'pending');

INSERT INTO public.support_tickets (reference, subject, description, customer_id, customer_name, channel, category, priority, status, assigned_to, sla_minutes_remaining, sla_breached, created_at) VALUES
 ('TKT-001','Payment gateway not working','Card charges failing with gateway timeout since this morning.','22222222-2222-4222-8222-000000000001','Tech Solutions Ltd','email','technical','critical','in_progress','11111111-1111-4111-8111-000000000001',12,false, now() - interval '10 minutes'),
 ('TKT-002','Cannot login to dashboard','SSO redirect loops back to the login screen.','22222222-2222-4222-8222-000000000002','Healthcare Plus','chat','access','high','assigned','11111111-1111-4111-8111-000000000002',45,false, now() - interval '25 minutes'),
 ('TKT-003','Invoice discrepancy','August invoice shows duplicate line item.','22222222-2222-4222-8222-000000000004','Retail Mart','email','billing','medium','new',NULL,120,false, now() - interval '1 hour'),
 ('TKT-004','Feature request - reporting','Needs scheduled PDF export of weekly reports.','22222222-2222-4222-8222-000000000003','EduLearn Academy','portal','feature','low','waiting','11111111-1111-4111-8111-000000000003',240,false, now() - interval '2 hours'),
 ('TKT-005','Integration failing','Webhook deliveries return 500 from partner endpoint.','22222222-2222-4222-8222-000000000005','Global Logistics','email','technical','high','resolved','11111111-1111-4111-8111-000000000004',0,false, now() - interval '3 hours'),
 ('TKT-006','Stock sync delayed','Inventory counts lag by two hours across stores.','22222222-2222-4222-8222-000000000004','Retail Mart','phone','technical','high','in_progress','11111111-1111-4111-8111-000000000002',18,false, now() - interval '4 hours'),
 ('TKT-007','Add three new users','Provision accounts for new front-desk staff.','22222222-2222-4222-8222-000000000007','Bluepeak Hospitality','chat','access','low','new',NULL,300,false, now() - interval '5 hours'),
 ('TKT-008','Data export corrupted','CSV export truncates after 10k rows.','22222222-2222-4222-8222-000000000001','Tech Solutions Ltd','email','technical','medium','assigned','11111111-1111-4111-8111-000000000005',-25,true, now() - interval '9 hours'),
 ('TKT-009','Refund not processed','Customer refund pending for six days.','22222222-2222-4222-8222-000000000007','Bluepeak Hospitality','email','billing','critical','in_progress','11111111-1111-4111-8111-000000000004',-90,true, now() - interval '2 days'),
 ('TKT-010','Training session request','Requesting admin training for new hires.','22222222-2222-4222-8222-000000000006','Northwind Manufacturing','portal','general','low','closed','11111111-1111-4111-8111-000000000003',0,false, now() - interval '6 days');

INSERT INTO public.support_escalations (ticket_id, reference, reason, level, status, raised_by, assigned_to) VALUES
 ((SELECT id FROM public.support_tickets WHERE reference='TKT-009'),'ESC-001','Refund SLA breached by 90 minutes',3,'open','11111111-1111-4111-8111-000000000004','11111111-1111-4111-8111-000000000010'),
 ((SELECT id FROM public.support_tickets WHERE reference='TKT-008'),'ESC-002','Export defect affecting enterprise reporting',2,'in_progress','11111111-1111-4111-8111-000000000005','11111111-1111-4111-8111-000000000001'),
 ((SELECT id FROM public.support_tickets WHERE reference='TKT-001'),'ESC-003','Revenue-impacting payment outage',3,'in_progress','11111111-1111-4111-8111-000000000001','11111111-1111-4111-8111-000000000010'),
 ((SELECT id FROM public.support_tickets WHERE reference='TKT-006'),'ESC-004','Repeat incident within 30 days',1,'resolved','11111111-1111-4111-8111-000000000002','11111111-1111-4111-8111-000000000004');

INSERT INTO public.call_logs (direction, caller_name, phone, customer_id, agent_id, status, duration_seconds, wait_seconds, notes, started_at) VALUES
 ('inbound','Lisa Pereira','+91 22 4890 1123','22222222-2222-4222-8222-000000000004','11111111-1111-4111-8111-000000000002','completed',742,38,'Walked through stock sync workaround', now() - interval '35 minutes'),
 ('inbound','John Davidson','+1 415 555 0142','22222222-2222-4222-8222-000000000001',NULL,'missed',0,124,'Callback required — payment outage', now() - interval '1 hour'),
 ('outbound','Anna Kowalski','+49 30 5557 0044','22222222-2222-4222-8222-000000000006','11111111-1111-4111-8111-000000000009','completed',1284,0,'QBR scheduling', now() - interval '3 hours'),
 ('inbound','Chen Wei','+852 3555 0190','22222222-2222-4222-8222-000000000007',NULL,'missed',0,96,'Refund status chase', now() - interval '5 hours'),
 ('inbound','James Turner','+971 4 555 0177','22222222-2222-4222-8222-000000000005','11111111-1111-4111-8111-000000000004','completed',498,22,'Confirmed webhook fix', now() - interval '7 hours'),
 ('outbound','Robert Keller','+44 20 7946 0321','22222222-2222-4222-8222-000000000003','11111111-1111-4111-8111-000000000008','completed',655,0,'School ERP pilot scoping', now() - interval '1 day'),
 ('inbound','Maria Santos','+1 617 555 0198','22222222-2222-4222-8222-000000000002','11111111-1111-4111-8111-000000000001','completed',930,45,'SSO troubleshooting', now() - interval '1 day 4 hours');

INSERT INTO public.email_queue (subject, from_email, from_name, preview, category, priority, status, assigned_to, received_at) VALUES
 ('Urgent: gateway still failing','john@techsolutions.com','John Davidson','We are still seeing declined transactions on the live site...','technical','critical','unread','11111111-1111-4111-8111-000000000001', now() - interval '8 minutes'),
 ('Re: SSO redirect loop','maria@healthcareplus.com','Maria Santos','Attaching the SAML response as requested...','access','high','open','11111111-1111-4111-8111-000000000002', now() - interval '40 minutes'),
 ('Invoice August 2026 query','lisa@retailmart.com','Lisa Pereira','Line item 4 appears twice on this invoice...','billing','medium','unread',NULL, now() - interval '2 hours'),
 ('Quote request — 50 seats','anna@northwindmfg.com','Anna Kowalski','Could you quote 50 additional seats for Q4...','sales','high','open','11111111-1111-4111-8111-000000000006', now() - interval '4 hours'),
 ('Refund follow-up (6 days)','chen@bluepeak.hk','Chen Wei','This is my third email about the pending refund...','billing','critical','open','11111111-1111-4111-8111-000000000004', now() - interval '6 hours'),
 ('Thanks for the quick fix','james@globallogistics.com','James Turner','Webhooks are delivering again, appreciate the help.','general','low','resolved','11111111-1111-4111-8111-000000000004', now() - interval '1 day');

INSERT INTO public.chat_sessions (id, visitor_name, visitor_email, channel, language, status, handled_by, agent_id, sentiment, unread_count, started_at) VALUES
 ('33333333-3333-4333-8333-000000000001','Robert Keller','robert@edulearn.edu','web','en','active','agent','11111111-1111-4111-8111-000000000003','neutral',2, now() - interval '12 minutes'),
 ('33333333-3333-4333-8333-000000000002','Priya Shah','priya.shah@zenithretail.in','whatsapp','hi','active','bot',NULL,'positive',0, now() - interval '5 minutes'),
 ('33333333-3333-4333-8333-000000000003','Chen Wei','chen@bluepeak.hk','web','zh','escalated','agent','11111111-1111-4111-8111-000000000004','negative',3, now() - interval '25 minutes'),
 ('33333333-3333-4333-8333-000000000004','Marc Dubois','marc@atelierlyon.fr','web','fr','closed','bot',NULL,'positive',0, now() - interval '3 hours'),
 ('33333333-3333-4333-8333-000000000005','Ahmed Nasser','ahmed@delta-trading.ae','android','ar','active','bot',NULL,'neutral',1, now() - interval '2 minutes');

INSERT INTO public.chat_messages (session_id, sender_type, sender_name, body, created_at) VALUES
 ('33333333-3333-4333-8333-000000000001','visitor','Robert Keller','Hi, can we add a second campus to our plan?', now() - interval '12 minutes'),
 ('33333333-3333-4333-8333-000000000001','agent','Lisa Park','Absolutely — I can enable multi-campus on the growth plan.', now() - interval '10 minutes'),
 ('33333333-3333-4333-8333-000000000001','visitor','Robert Keller','What is the pricing difference?', now() - interval '9 minutes'),
 ('33333333-3333-4333-8333-000000000002','visitor','Priya Shah','Order sync kab tak theek hoga?', now() - interval '5 minutes'),
 ('33333333-3333-4333-8333-000000000002','bot','Vala Assistant','Sync backlog clears within 30 minutes. Shall I notify you when done?', now() - interval '4 minutes'),
 ('33333333-3333-4333-8333-000000000003','visitor','Chen Wei','My refund has been pending for six days.', now() - interval '25 minutes'),
 ('33333333-3333-4333-8333-000000000003','bot','Vala Assistant','I am escalating this to a billing specialist now.', now() - interval '24 minutes'),
 ('33333333-3333-4333-8333-000000000003','agent','Emma Davis','I have raised this with finance and will confirm today.', now() - interval '20 minutes'),
 ('33333333-3333-4333-8333-000000000005','visitor','Ahmed Nasser','How do I export invoices?', now() - interval '2 minutes');

INSERT INTO public.chatbots (id, name, purpose, channel, status, language, conversations, resolution_rate, escalation_rate) VALUES
 ('44444444-4444-4444-8444-000000000001','Vala Web Assistant','First-line website support','web','active','en',18432,74.50,12.30),
 ('44444444-4444-4444-8444-000000000002','Vala WhatsApp Bot','Order and billing queries','whatsapp','active','hi',9241,68.10,17.80),
 ('44444444-4444-4444-8444-000000000003','Vala Android In-App','In-app help and onboarding','android','active','en',6120,71.90,14.20),
 ('44444444-4444-4444-8444-000000000004','Sales Qualifier Bot','Lead capture and qualification','web','paused','en',3387,62.40,9.60);

INSERT INTO public.bot_training_documents (bot_id, title, source_type, status, chunks, accuracy, last_trained_at) VALUES
 ('44444444-4444-4444-8444-000000000001','Product Handbook v9','document','trained',412,92.40, now() - interval '2 days'),
 ('44444444-4444-4444-8444-000000000001','Billing FAQ','faq','trained',86,95.10, now() - interval '5 days'),
 ('44444444-4444-4444-8444-000000000002','WhatsApp Order Flows','document','training',134,0, now() - interval '1 hour'),
 ('44444444-4444-4444-8444-000000000003','Android Onboarding Guide','document','trained',198,89.70, now() - interval '9 days'),
 ('44444444-4444-4444-8444-000000000004','Discovery Question Bank','faq','failed',0,0, now() - interval '12 days'),
 ('44444444-4444-4444-8444-000000000001','Help Centre Crawl','url','trained',1044,88.20, now() - interval '1 day');

INSERT INTO public.automation_rules (name, scope, trigger_event, condition_text, action_text, is_enabled, runs_count, last_run_at) VALUES
 ('Auto-assign critical tickets','support','ticket_created','priority = critical','Assign to on-shift escalation lead and notify manager',true,842, now() - interval '18 minutes'),
 ('SLA breach warning','support','sla_timer','remaining < 15 minutes','Notify assignee and manager on buzzer channel',true,1276, now() - interval '6 minutes'),
 ('Hot lead routing','sales','lead_created','urgency = hot','Assign to senior AE with lowest open pipeline',true,318, now() - interval '2 hours'),
 ('Bot escalation handoff','chatbot','bot_confidence','confidence < 60%','Transfer conversation to live agent queue',true,2941, now() - interval '11 minutes'),
 ('Dormant lead nudge','sales','lead_idle','no activity for 7 days','Create follow-up task for owner',false,97, now() - interval '9 days'),
 ('CSAT follow-up','support','ticket_resolved','csat <= 3','Create quality audit task for team lead',true,164, now() - interval '1 day');

INSERT INTO public.bot_conversation_logs (bot_id, session_id, intent, confidence, outcome, language, message_count, created_at) VALUES
 ('44444444-4444-4444-8444-000000000001','33333333-3333-4333-8333-000000000004','pricing_question',91.20,'resolved','fr',6, now() - interval '3 hours'),
 ('44444444-4444-4444-8444-000000000002','33333333-3333-4333-8333-000000000002','order_status',84.60,'resolved','hi',4, now() - interval '5 minutes'),
 ('44444444-4444-4444-8444-000000000001','33333333-3333-4333-8333-000000000003','refund_request',52.30,'escalated','zh',3, now() - interval '25 minutes'),
 ('44444444-4444-4444-8444-000000000003','33333333-3333-4333-8333-000000000005','invoice_export',78.90,'in_progress','ar',2, now() - interval '2 minutes'),
 ('44444444-4444-4444-8444-000000000001',NULL,'integration_help',66.40,'escalated','en',7, now() - interval '1 day'),
 ('44444444-4444-4444-8444-000000000004',NULL,'lead_qualification',73.10,'resolved','en',9, now() - interval '2 days');

INSERT INTO public.bot_languages (code, name, is_enabled, coverage, conversations) VALUES
 ('en','English',true,98.50,18432),
 ('hi','Hindi',true,86.20,9241),
 ('ar','Arabic',true,74.80,3120),
 ('fr','French',true,81.40,2210),
 ('zh','Chinese (Simplified)',true,69.30,1874),
 ('es','Spanish',false,58.10,640),
 ('de','German',true,77.60,1432);

INSERT INTO public.canned_responses (title, category, body, shortcut, usage_count) VALUES
 ('Payment gateway outage acknowledgement','technical','Thank you for reporting this. Our engineers are actively investigating the gateway timeouts and we will update you within 30 minutes.','/gateway',312),
 ('SSO login troubleshooting','access','Please clear cached credentials and confirm your identity provider certificate has not expired. If the loop persists, share the SAML response so we can inspect it.','/sso',188),
 ('Invoice correction','billing','We have reviewed your invoice and issued a corrected copy. The adjusted balance will appear in your billing portal within one business day.','/invoice',241),
 ('Feature request logged','feature','Your request has been logged with our product team and linked to your account so we can notify you when it ships.','/feature',96),
 ('Escalation confirmation','general','I have escalated this to our senior team with priority handling. You will receive an update from the assigned specialist shortly.','/escalate',157);

INSERT INTO public.wiki_articles (title, category, summary, body, views, helpful_count, status) VALUES
 ('Resolving payment gateway timeouts','technical','Diagnostic steps for gateway 504 errors.','Check processor status page, verify webhook retry queue, then re-run the failed batch from the payments console.',2841,417,'published'),
 ('SSO redirect loop checklist','access','Common causes of SAML redirect loops.','Validate clock skew, certificate expiry, entity ID mismatch and cookie SameSite settings in that order.',1963,288,'published'),
 ('Billing adjustments and credit notes','billing','How to issue corrections.','Open the invoice, choose adjust, add the credit line and re-issue. Finance approval is required above 1,000 USD.',1544,201,'published'),
 ('Escalation matrix','process','When and how to escalate.','Level 1 team lead, level 2 escalation lead, level 3 sales and support manager. Revenue-impacting incidents start at level 3.',1102,176,'published'),
 ('Bot handoff best practice','chatbot','Smooth transfer from bot to agent.','Always pass conversation summary, detected intent and confidence score to the agent queue.',874,133,'published'),
 ('Onboarding a new enterprise account','process','Standard 30 day onboarding plan.','Kickoff, data migration, admin training, go-live review and 30 day adoption check.',659,98,'draft');
