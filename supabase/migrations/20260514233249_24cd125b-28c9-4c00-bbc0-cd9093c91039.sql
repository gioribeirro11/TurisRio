DROP POLICY IF EXISTS "anyone can create support ticket" ON public.support_tickets;
CREATE POLICY "anyone can create support ticket"
ON public.support_tickets
FOR INSERT
TO public
WITH CHECK (user_id IS NULL OR user_id = auth.uid());