DO $$ BEGIN
  CREATE TYPE public.app_role AS ENUM ('boss_owner','super_admin','admin','sales_support_manager','sales','support','client','customer');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.remote_assist_status AS ENUM ('pending','connected','active','ended','expired','cancelled','terminated');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.remote_assist_mode AS ENUM ('view_only','guided_cursor');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE OR REPLACE FUNCTION public.is_support_staff(_user_id UUID)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id
      AND role IN ('boss_owner','super_admin','admin','sales_support_manager','support','sales')
  )
$$;

DROP POLICY IF EXISTS "Users can view own roles" ON public.user_roles;
CREATE POLICY "Users can view own roles" ON public.user_roles
  FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'super_admin'));

CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module TEXT NOT NULL,
  action TEXT NOT NULL,
  user_id UUID,
  role public.app_role,
  meta_json JSONB,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.audit_logs TO authenticated;
GRANT ALL ON public.audit_logs TO service_role;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Authenticated can write audit logs" ON public.audit_logs;
CREATE POLICY "Authenticated can write audit logs" ON public.audit_logs
  FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);
DROP POLICY IF EXISTS "Staff can read audit logs" ON public.audit_logs;
CREATE POLICY "Staff can read audit logs" ON public.audit_logs
  FOR SELECT TO authenticated USING (public.is_support_staff(auth.uid()) OR user_id = auth.uid());

CREATE TABLE IF NOT EXISTS public.blackbox_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL,
  module_name TEXT NOT NULL,
  entity_type TEXT,
  entity_id UUID,
  user_id UUID,
  role_name TEXT,
  ip_address TEXT,
  geo_location TEXT,
  device_fingerprint TEXT,
  user_agent TEXT,
  risk_score INTEGER DEFAULT 0,
  metadata JSONB DEFAULT '{}',
  is_sealed BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.blackbox_events TO authenticated;
GRANT ALL ON public.blackbox_events TO service_role;
ALTER TABLE public.blackbox_events ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.prevent_blackbox_modification()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  RAISE EXCEPTION 'BLACKBOX is immutable - modifications are forbidden';
END; $$;

DROP TRIGGER IF EXISTS blackbox_no_update ON public.blackbox_events;
CREATE TRIGGER blackbox_no_update BEFORE UPDATE ON public.blackbox_events
  FOR EACH ROW EXECUTE FUNCTION public.prevent_blackbox_modification();
DROP TRIGGER IF EXISTS blackbox_no_delete ON public.blackbox_events;
CREATE TRIGGER blackbox_no_delete BEFORE DELETE ON public.blackbox_events
  FOR EACH ROW EXECUTE FUNCTION public.prevent_blackbox_modification();

DROP POLICY IF EXISTS "Authenticated can seal blackbox events" ON public.blackbox_events;
CREATE POLICY "Authenticated can seal blackbox events" ON public.blackbox_events
  FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);
DROP POLICY IF EXISTS "Staff can read blackbox events" ON public.blackbox_events;
CREATE POLICY "Staff can read blackbox events" ON public.blackbox_events
  FOR SELECT TO authenticated USING (public.is_support_staff(auth.uid()));

CREATE TABLE IF NOT EXISTS public.user_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('info','success','warning','danger','priority')),
  message TEXT NOT NULL,
  event_type TEXT,
  action_label TEXT,
  action_url TEXT,
  is_buzzer BOOLEAN DEFAULT false,
  is_read BOOLEAN DEFAULT false,
  is_dismissed BOOLEAN DEFAULT false,
  role_target TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  read_at TIMESTAMPTZ,
  dismissed_at TIMESTAMPTZ
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_notifications TO authenticated;
GRANT ALL ON public.user_notifications TO service_role;
ALTER TABLE public.user_notifications ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users view own notifications" ON public.user_notifications;
CREATE POLICY "Users view own notifications" ON public.user_notifications
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Authenticated insert notifications" ON public.user_notifications;
CREATE POLICY "Authenticated insert notifications" ON public.user_notifications
  FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);
DROP POLICY IF EXISTS "Users update own notifications" ON public.user_notifications;
CREATE POLICY "Users update own notifications" ON public.user_notifications
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users delete own notifications" ON public.user_notifications;
CREATE POLICY "Users delete own notifications" ON public.user_notifications
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS public.quick_support_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  user_email TEXT,
  user_name TEXT,
  request_type TEXT,
  priority TEXT DEFAULT 'normal',
  subject TEXT NOT NULL,
  description TEXT NOT NULL,
  attachments JSONB DEFAULT '[]',
  status TEXT DEFAULT 'open',
  assigned_to UUID,
  ai_suggested_solution TEXT,
  resolution_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  resolved_at TIMESTAMPTZ,
  response_time_minutes INTEGER
);
GRANT SELECT, INSERT, UPDATE ON public.quick_support_requests TO authenticated;
GRANT ALL ON public.quick_support_requests TO service_role;
ALTER TABLE public.quick_support_requests ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_quick_support_status ON public.quick_support_requests(status);
DROP POLICY IF EXISTS "Users view own support requests" ON public.quick_support_requests;
CREATE POLICY "Users view own support requests" ON public.quick_support_requests
  FOR SELECT TO authenticated USING (auth.uid() = user_id OR public.is_support_staff(auth.uid()));
DROP POLICY IF EXISTS "Users create support requests" ON public.quick_support_requests;
CREATE POLICY "Users create support requests" ON public.quick_support_requests
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Staff update support requests" ON public.quick_support_requests;
CREATE POLICY "Staff update support requests" ON public.quick_support_requests
  FOR UPDATE TO authenticated USING (public.is_support_staff(auth.uid()));

CREATE TABLE IF NOT EXISTS public.safe_assist_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_code VARCHAR(8) NOT NULL UNIQUE,
  user_id UUID NOT NULL,
  user_role public.app_role,
  support_agent_id UUID,
  support_agent_role public.app_role,
  status public.remote_assist_status NOT NULL DEFAULT 'pending',
  mode public.remote_assist_mode NOT NULL DEFAULT 'guided_cursor',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  started_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '5 minutes'),
  max_duration_minutes INTEGER NOT NULL DEFAULT 30,
  user_consent_given BOOLEAN NOT NULL DEFAULT false,
  user_consent_at TIMESTAMPTZ,
  is_recording_enabled BOOLEAN NOT NULL DEFAULT true,
  recording_url TEXT,
  agent_masked_id VARCHAR(20),
  agent_watermark_text TEXT,
  user_ip_address TEXT,
  user_device_fingerprint TEXT,
  agent_ip_address TEXT,
  agent_device_fingerprint TEXT,
  ended_by UUID,
  end_reason TEXT,
  user_entered_agent_code VARCHAR(10),
  agent_entered_user_code VARCHAR(10),
  user_verification_code VARCHAR(10),
  agent_verification_code VARCHAR(10),
  dual_verified BOOLEAN DEFAULT false,
  ai_monitoring_enabled BOOLEAN DEFAULT true,
  ai_risk_score INTEGER DEFAULT 0,
  ai_flags JSONB DEFAULT '[]'::jsonb,
  client_notified_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public.safe_assist_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES public.safe_assist_sessions(id) ON DELETE CASCADE,
  event_type VARCHAR(50) NOT NULL,
  event_data JSONB NOT NULL DEFAULT '{}',
  timestamp TIMESTAMPTZ NOT NULL DEFAULT now(),
  actor_type VARCHAR(20) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.safe_assist_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES public.safe_assist_sessions(id) ON DELETE CASCADE,
  alert_type VARCHAR(50) NOT NULL,
  recipients TEXT[] NOT NULL DEFAULT '{}',
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.safe_assist_ai_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES public.safe_assist_sessions(id) ON DELETE CASCADE,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT now(),
  event_type VARCHAR(50) NOT NULL,
  risk_level VARCHAR(20) DEFAULT 'low',
  ai_analysis JSONB,
  action_recommended VARCHAR(100),
  action_taken VARCHAR(100),
  auto_handled BOOLEAN DEFAULT false
);

CREATE TABLE IF NOT EXISTS public.safe_assist_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES public.safe_assist_sessions(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  notification_type VARCHAR(50) NOT NULL,
  title VARCHAR(200) NOT NULL,
  message TEXT,
  severity VARCHAR(20) DEFAULT 'info',
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE ON public.safe_assist_sessions TO authenticated;
GRANT SELECT, INSERT ON public.safe_assist_events TO authenticated;
GRANT SELECT, INSERT ON public.safe_assist_alerts TO authenticated;
GRANT SELECT, INSERT ON public.safe_assist_ai_logs TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.safe_assist_notifications TO authenticated;
GRANT ALL ON public.safe_assist_sessions TO service_role;
GRANT ALL ON public.safe_assist_events TO service_role;
GRANT ALL ON public.safe_assist_alerts TO service_role;
GRANT ALL ON public.safe_assist_ai_logs TO service_role;
GRANT ALL ON public.safe_assist_notifications TO service_role;

ALTER TABLE public.safe_assist_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.safe_assist_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.safe_assist_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.safe_assist_ai_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.safe_assist_notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Participants view sessions" ON public.safe_assist_sessions;
CREATE POLICY "Participants view sessions" ON public.safe_assist_sessions
  FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR support_agent_id = auth.uid() OR public.is_support_staff(auth.uid()));
DROP POLICY IF EXISTS "Participants update sessions" ON public.safe_assist_sessions;
CREATE POLICY "Participants update sessions" ON public.safe_assist_sessions
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid() OR support_agent_id = auth.uid() OR public.is_support_staff(auth.uid()));
DROP POLICY IF EXISTS "Users create own sessions" ON public.safe_assist_sessions;
CREATE POLICY "Users create own sessions" ON public.safe_assist_sessions
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Participants view events" ON public.safe_assist_events;
CREATE POLICY "Participants view events" ON public.safe_assist_events
  FOR SELECT TO authenticated USING (EXISTS (
    SELECT 1 FROM public.safe_assist_sessions s WHERE s.id = session_id
      AND (s.user_id = auth.uid() OR s.support_agent_id = auth.uid() OR public.is_support_staff(auth.uid()))
  ));
DROP POLICY IF EXISTS "Participants log events" ON public.safe_assist_events;
CREATE POLICY "Participants log events" ON public.safe_assist_events
  FOR INSERT TO authenticated WITH CHECK (EXISTS (
    SELECT 1 FROM public.safe_assist_sessions s WHERE s.id = session_id
      AND (s.user_id = auth.uid() OR s.support_agent_id = auth.uid())
  ));

DROP POLICY IF EXISTS "Staff view alerts" ON public.safe_assist_alerts;
CREATE POLICY "Staff view alerts" ON public.safe_assist_alerts
  FOR SELECT TO authenticated USING (public.is_support_staff(auth.uid()));
DROP POLICY IF EXISTS "Authenticated insert alerts" ON public.safe_assist_alerts;
CREATE POLICY "Authenticated insert alerts" ON public.safe_assist_alerts
  FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Staff view ai logs" ON public.safe_assist_ai_logs;
CREATE POLICY "Staff view ai logs" ON public.safe_assist_ai_logs
  FOR SELECT TO authenticated USING (public.is_support_staff(auth.uid()) OR EXISTS (
    SELECT 1 FROM public.safe_assist_sessions s WHERE s.id = session_id AND s.user_id = auth.uid()
  ));
DROP POLICY IF EXISTS "Participants insert ai logs" ON public.safe_assist_ai_logs;
CREATE POLICY "Participants insert ai logs" ON public.safe_assist_ai_logs
  FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Users view own assist notifications" ON public.safe_assist_notifications;
CREATE POLICY "Users view own assist notifications" ON public.safe_assist_notifications
  FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.is_support_staff(auth.uid()));
DROP POLICY IF EXISTS "Staff create assist notifications" ON public.safe_assist_notifications;
CREATE POLICY "Staff create assist notifications" ON public.safe_assist_notifications
  FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);
DROP POLICY IF EXISTS "Users update own assist notifications" ON public.safe_assist_notifications;
CREATE POLICY "Users update own assist notifications" ON public.safe_assist_notifications
  FOR UPDATE TO authenticated USING (user_id = auth.uid());

CREATE OR REPLACE FUNCTION public.generate_session_code()
RETURNS TEXT LANGUAGE plpgsql SET search_path = public AS $$
DECLARE
  chars TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  result TEXT := '';
  i INTEGER;
BEGIN
  FOR i IN 1..8 LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::INTEGER, 1);
  END LOOP;
  RETURN result;
END; $$;

CREATE OR REPLACE FUNCTION public.generate_verification_code()
RETURNS VARCHAR(6) LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  RETURN UPPER(SUBSTRING(MD5(RANDOM()::TEXT || NOW()::TEXT) FROM 1 FOR 6));
END; $$;

CREATE OR REPLACE FUNCTION public.create_remote_assist_session()
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_session_id UUID;
  v_session_code TEXT;
  v_user_role public.app_role;
  v_user_code VARCHAR(6);
BEGIN
  SELECT role INTO v_user_role FROM public.user_roles WHERE user_id = auth.uid() LIMIT 1;

  IF EXISTS (
    SELECT 1 FROM public.safe_assist_sessions
    WHERE user_id = auth.uid() AND status IN ('pending','connected','active')
  ) THEN
    RETURN jsonb_build_object('success', false, 'error', 'You already have an active support session');
  END IF;

  LOOP
    v_session_code := public.generate_session_code();
    EXIT WHEN NOT EXISTS (SELECT 1 FROM public.safe_assist_sessions WHERE session_code = v_session_code);
  END LOOP;

  v_user_code := public.generate_verification_code();

  INSERT INTO public.safe_assist_sessions (session_code, user_id, user_role, mode, expires_at, user_verification_code)
  VALUES (v_session_code, auth.uid(), v_user_role, 'guided_cursor', now() + interval '5 minutes', v_user_code)
  RETURNING id INTO v_session_id;

  INSERT INTO public.audit_logs (user_id, action, module, role, meta_json)
  VALUES (auth.uid(), 'safe_assist_session_created', 'safe_assist', v_user_role,
          jsonb_build_object('session_id', v_session_id));

  RETURN jsonb_build_object('success', true, 'session_id', v_session_id, 'session_code', v_session_code,
                            'verification_code', v_user_code, 'expires_at', now() + interval '5 minutes');
END; $$;

CREATE OR REPLACE FUNCTION public.join_remote_assist_session(p_session_code TEXT)
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_session RECORD;
  v_agent_role public.app_role;
  v_masked_id TEXT;
  v_agent_code VARCHAR(6);
BEGIN
  SELECT role INTO v_agent_role FROM public.user_roles WHERE user_id = auth.uid() LIMIT 1;

  IF NOT public.is_support_staff(auth.uid()) THEN
    INSERT INTO public.audit_logs (user_id, action, module, role, meta_json)
    VALUES (auth.uid(), 'unauthorized_safe_assist_join', 'safe_assist', v_agent_role,
            jsonb_build_object('session_code', p_session_code, 'blocked', true));
    RETURN jsonb_build_object('success', false, 'error', 'Access denied: Only support staff can join sessions');
  END IF;

  SELECT * INTO v_session FROM public.safe_assist_sessions
  WHERE session_code = upper(p_session_code) AND status = 'pending' AND expires_at > now()
  FOR UPDATE;

  IF v_session IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Invalid or expired session code');
  END IF;

  v_masked_id := coalesce(v_agent_role::text, 'support') || '_' || substr(md5(auth.uid()::text), 1, 6);
  v_agent_code := public.generate_verification_code();

  UPDATE public.safe_assist_sessions
  SET support_agent_id = auth.uid(),
      support_agent_role = v_agent_role,
      agent_masked_id = v_masked_id,
      agent_verification_code = v_agent_code,
      agent_watermark_text = 'Support: ' || v_masked_id || ' | ' || to_char(now(), 'YYYY-MM-DD HH24:MI')
  WHERE id = v_session.id;

  INSERT INTO public.safe_assist_alerts (session_id, alert_type, recipients, message)
  VALUES (v_session.id, 'session_joined', ARRAY['super_admin','admin'],
          'Support agent ' || v_masked_id || ' joined session with user');

  INSERT INTO public.audit_logs (user_id, action, module, role, meta_json)
  VALUES (auth.uid(), 'safe_assist_joined', 'safe_assist', v_agent_role,
          jsonb_build_object('session_id', v_session.id, 'user_id', v_session.user_id));

  RETURN jsonb_build_object('success', true, 'session_id', v_session.id, 'user_id', v_session.user_id,
                            'user_role', v_session.user_role, 'mode', v_session.mode,
                            'masked_id', v_masked_id, 'verification_code', v_agent_code);
END; $$;

CREATE OR REPLACE FUNCTION public.give_remote_assist_consent(p_session_id UUID)
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_session RECORD;
BEGIN
  SELECT * INTO v_session FROM public.safe_assist_sessions
  WHERE id = p_session_id AND user_id = auth.uid() FOR UPDATE;

  IF v_session IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Session not found');
  END IF;

  IF v_session.support_agent_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'No support agent has joined yet');
  END IF;

  UPDATE public.safe_assist_sessions
  SET user_consent_given = true, user_consent_at = now(), status = 'active', started_at = now(),
      expires_at = now() + (max_duration_minutes || ' minutes')::interval
  WHERE id = p_session_id;

  INSERT INTO public.safe_assist_events (session_id, event_type, event_data, actor_type)
  VALUES (p_session_id, 'consent_given', jsonb_build_object('timestamp', now()), 'user');

  INSERT INTO public.safe_assist_alerts (session_id, alert_type, recipients, message)
  VALUES (p_session_id, 'session_started', ARRAY['super_admin','admin'],
          'Safe Assist session started: ' || v_session.session_code);

  RETURN jsonb_build_object('success', true, 'session_id', p_session_id,
                            'expires_at', now() + (v_session.max_duration_minutes || ' minutes')::interval);
END; $$;

CREATE OR REPLACE FUNCTION public.verify_safe_assist_connection(
  p_session_id UUID, p_user_code VARCHAR(6), p_agent_code VARCHAR(6), p_is_agent BOOLEAN)
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_session RECORD;
BEGIN
  SELECT * INTO v_session FROM public.safe_assist_sessions WHERE id = p_session_id;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Session not found');
  END IF;

  IF p_is_agent THEN
    UPDATE public.safe_assist_sessions SET agent_entered_user_code = p_user_code WHERE id = p_session_id;
  ELSE
    UPDATE public.safe_assist_sessions SET user_entered_agent_code = p_agent_code WHERE id = p_session_id;
  END IF;

  SELECT * INTO v_session FROM public.safe_assist_sessions WHERE id = p_session_id;

  IF v_session.user_entered_agent_code IS NOT NULL AND v_session.agent_entered_user_code IS NOT NULL THEN
    IF upper(v_session.user_entered_agent_code) <> upper(coalesce(v_session.agent_verification_code, ''))
       OR upper(v_session.agent_entered_user_code) <> upper(coalesce(v_session.user_verification_code, '')) THEN
      RETURN jsonb_build_object('success', false, 'error', 'Verification codes do not match');
    END IF;

    UPDATE public.safe_assist_sessions SET dual_verified = true, status = 'connected' WHERE id = p_session_id;

    INSERT INTO public.safe_assist_notifications (session_id, user_id, notification_type, title, message, severity)
    VALUES (p_session_id, v_session.user_id, 'session_connected', 'Safe Assist Connected',
            'Support agent has connected to your session. All actions are monitored by AI.', 'info');

    RETURN jsonb_build_object('success', true, 'message', 'Connection verified');
  END IF;

  RETURN jsonb_build_object('success', true, 'message', 'Code entered, waiting for other party');
END; $$;

CREATE OR REPLACE FUNCTION public.log_safe_assist_ai_event(
  p_session_id UUID, p_event_type VARCHAR(50), p_risk_level VARCHAR(20), p_analysis JSONB,
  p_recommended_action VARCHAR(100), p_auto_handle BOOLEAN DEFAULT FALSE)
RETURNS UUID LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_log_id UUID;
  v_session RECORD;
BEGIN
  SELECT * INTO v_session FROM public.safe_assist_sessions WHERE id = p_session_id;

  INSERT INTO public.safe_assist_ai_logs (session_id, event_type, risk_level, ai_analysis, action_recommended, auto_handled)
  VALUES (p_session_id, p_event_type, p_risk_level, p_analysis, p_recommended_action, p_auto_handle)
  RETURNING id INTO v_log_id;

  UPDATE public.safe_assist_sessions
  SET ai_risk_score = ai_risk_score + CASE
        WHEN p_risk_level = 'critical' THEN 50
        WHEN p_risk_level = 'high' THEN 30
        WHEN p_risk_level = 'medium' THEN 15
        ELSE 5 END,
      ai_flags = ai_flags || jsonb_build_array(jsonb_build_object('type', p_event_type, 'risk', p_risk_level, 'time', now()))
  WHERE id = p_session_id;

  IF p_risk_level = 'critical' AND p_auto_handle THEN
    UPDATE public.safe_assist_sessions SET status = 'terminated', ended_at = now() WHERE id = p_session_id;
    INSERT INTO public.safe_assist_notifications (session_id, user_id, notification_type, title, message, severity)
    VALUES (p_session_id, v_session.user_id, 'session_terminated', 'Safe Assist Terminated',
            'Session was automatically terminated due to security concerns. Our team will contact you.', 'error');
  ELSIF p_risk_level IN ('high','critical') THEN
    INSERT INTO public.safe_assist_notifications (session_id, user_id, notification_type, title, message, severity)
    VALUES (p_session_id, v_session.user_id, 'security_alert', 'Security Alert',
            'Unusual activity detected. AI is monitoring closely. Click to review.', 'warning');
  END IF;

  RETURN v_log_id;
END; $$;

CREATE OR REPLACE FUNCTION public.end_remote_assist_session(p_session_id UUID, p_reason TEXT DEFAULT 'User ended session')
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_session RECORD;
BEGIN
  SELECT * INTO v_session FROM public.safe_assist_sessions
  WHERE id = p_session_id AND (user_id = auth.uid() OR support_agent_id = auth.uid()) FOR UPDATE;

  IF v_session IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Session not found or access denied');
  END IF;

  UPDATE public.safe_assist_sessions
  SET status = 'ended', ended_at = now(), ended_by = auth.uid(), end_reason = p_reason
  WHERE id = p_session_id;

  INSERT INTO public.safe_assist_events (session_id, event_type, event_data, actor_type)
  VALUES (p_session_id, 'session_ended', jsonb_build_object('reason', p_reason, 'ended_by', auth.uid()), 'system');

  INSERT INTO public.safe_assist_alerts (session_id, alert_type, recipients, message)
  VALUES (p_session_id, 'session_ended', ARRAY['super_admin','admin'],
          'Safe Assist session ended: ' || v_session.session_code || ' - ' || p_reason);

  RETURN jsonb_build_object('success', true, 'session_id', p_session_id);
END; $$;