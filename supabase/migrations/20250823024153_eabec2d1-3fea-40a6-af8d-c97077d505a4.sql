-- Create podcasts table to replace Firestore collection
CREATE TABLE public.podcasts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  banner_url TEXT NOT NULL,
  audio_url TEXT NOT NULL,
  categories TEXT[] DEFAULT '{}',
  keywords TEXT[] DEFAULT '{}',
  name_lowercase TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.podcasts ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access (since podcasts are public content)
CREATE POLICY "Anyone can view podcasts" 
ON public.podcasts 
FOR SELECT 
USING (true);

-- Create policies for authenticated admin users to manage podcasts
CREATE POLICY "Authenticated users can create podcasts" 
ON public.podcasts 
FOR INSERT 
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update podcasts" 
ON public.podcasts 
FOR UPDATE 
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can delete podcasts" 
ON public.podcasts 
FOR DELETE 
TO authenticated
USING (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_podcasts_updated_at
BEFORE UPDATE ON public.podcasts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_podcasts_categories ON public.podcasts USING GIN(categories);
CREATE INDEX idx_podcasts_keywords ON public.podcasts USING GIN(keywords);
CREATE INDEX idx_podcasts_name_lowercase ON public.podcasts (name_lowercase);
CREATE INDEX idx_podcasts_created_at ON public.podcasts (created_at DESC);