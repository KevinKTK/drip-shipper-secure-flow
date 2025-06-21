ALTER TABLE public.orders
ADD COLUMN selected_insurance_policy_id UUID,
ADD CONSTRAINT fk_insurance_policy
FOREIGN KEY (selected_insurance_policy_id)
REFERENCES public.insurance_templates(id); 