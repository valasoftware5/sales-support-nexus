DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'team_members','crm_customers','crm_tasks','sales_leads','sales_deals','sales_commissions',
    'support_tickets','support_escalations','call_logs','email_queue','chat_sessions','chat_messages',
    'chatbots','bot_training_documents','bot_languages','bot_conversation_logs','automation_rules',
    'canned_responses','wiki_articles'
  ]
  LOOP
    EXECUTE format('GRANT SELECT, INSERT, UPDATE, DELETE ON public.%I TO anon', t);
    EXECUTE format('GRANT SELECT, INSERT, UPDATE, DELETE ON public.%I TO authenticated', t);
    EXECUTE format('GRANT ALL ON public.%I TO service_role', t);
    EXECUTE format('DROP POLICY IF EXISTS "console read %s" ON public.%I', t, t);
    EXECUTE format('CREATE POLICY "console read %s" ON public.%I FOR SELECT TO anon USING (true)', t, t);
    EXECUTE format('DROP POLICY IF EXISTS "console write %s" ON public.%I', t, t);
    EXECUTE format('CREATE POLICY "console write %s" ON public.%I FOR ALL TO anon USING (true) WITH CHECK (true)', t, t);
  END LOOP;
END $$;