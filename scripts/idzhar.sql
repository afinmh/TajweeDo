-- Idzhar Halqi content + audio seeder
-- Run AFTER supabase.sql (and enum step) to refine questions and add audio URLs.

-- 1) Update content for SELECT_ALL challenges (order 1 & 2)
UPDATE public.challenges
SET question = 'Nun mati dibaca dengan jelas tanpa dengung ketika bertemu huruf halqi (ا، هـ، ع، ح، غ، خ).'
WHERE id = 1001;

UPDATE public.challenges
SET question = 'Nun mati bertemu huruf Idzhar Halqi. Pilih semua huruf Idzhar Halqi berikut.'
WHERE id = 1002;

-- 2) Add audio to options (words: /audio/materi/idzhar, letters: /audio/materi/hijaiyah)
-- Q1 (1001) words - all correct
UPDATE public.challenge_options SET audio_src = '/audio/materi/idzhar/yanhituna.mp3' WHERE challenge_id = 1001 AND text = 'يَنْحِتُونَ';
UPDATE public.challenge_options SET audio_src = '/audio/materi/idzhar/man-khafa.mp3' WHERE challenge_id = 1001 AND text = 'مَنْ خَافَ';
UPDATE public.challenge_options SET audio_src = '/audio/materi/idzhar/min-hadin.mp3' WHERE challenge_id = 1001 AND text = 'مِنْ هَادٍ';
UPDATE public.challenge_options SET audio_src = '/audio/materi/idzhar/an-amta.mp3' WHERE challenge_id = 1001 AND text = 'أَنْعَمْتَ';

-- Q2 (1002) hijaiyah (all correct)
UPDATE public.challenge_options SET audio_src = '/audio/materi/hijaiyah/alif.mp3' WHERE challenge_id = 1002 AND text = 'ا';
UPDATE public.challenge_options SET audio_src = '/audio/materi/hijaiyah/haa.mp3' WHERE challenge_id = 1002 AND text = 'هـ';
UPDATE public.challenge_options SET audio_src = '/audio/materi/hijaiyah/ain.mp3' WHERE challenge_id = 1002 AND text = 'ع';
UPDATE public.challenge_options SET audio_src = '/audio/materi/hijaiyah/ha.mp3' WHERE challenge_id = 1002 AND text = 'ح';
UPDATE public.challenge_options SET audio_src = '/audio/materi/hijaiyah/ghain.mp3' WHERE challenge_id = 1002 AND text = 'غ';
UPDATE public.challenge_options SET audio_src = '/audio/materi/hijaiyah/kha.mp3' WHERE challenge_id = 1002 AND text = 'خ';

-- Q4 (1004) hijaiyah
UPDATE public.challenge_options SET audio_src = '/audio/materi/hijaiyah/ghain.mp3' WHERE challenge_id = 1004 AND text = 'غ';
UPDATE public.challenge_options SET audio_src = '/audio/materi/hijaiyah/mim.mp3' WHERE challenge_id = 1004 AND text = 'م';
UPDATE public.challenge_options SET audio_src = '/audio/materi/hijaiyah/ya.mp3' WHERE challenge_id = 1004 AND text = 'ي';
UPDATE public.challenge_options SET audio_src = '/audio/materi/hijaiyah/nun.mp3' WHERE challenge_id = 1004 AND text = 'ن';

-- Q5 (1005) words
UPDATE public.challenge_options SET audio_src = '/audio/materi/idzhar/min-amrihi.mp3' WHERE challenge_id = 1005 AND text = 'مِنْ أَمْرِهِ';
UPDATE public.challenge_options SET audio_src = '/audio/materi/idzhar/man-yaqulu.mp3' WHERE challenge_id = 1005 AND text = 'مَنْ يَقُولُ';
UPDATE public.challenge_options SET audio_src = '/audio/materi/idzhar/man-wara-ihim.mp3' WHERE challenge_id = 1005 AND text = 'مَنْ وَرَائِهِمْ';
UPDATE public.challenge_options SET audio_src = '/audio/materi/idzhar/man-rabbihim.mp3' WHERE challenge_id = 1005 AND text = 'مَنْ رَبِّهِمْ';

-- Q6 (1006) hijaiyah
UPDATE public.challenge_options SET audio_src = '/audio/materi/hijaiyah/alif.mp3' WHERE challenge_id = 1006 AND text = 'ا';
UPDATE public.challenge_options SET audio_src = '/audio/materi/hijaiyah/waw.mp3' WHERE challenge_id = 1006 AND text = 'و';
UPDATE public.challenge_options SET audio_src = '/audio/materi/hijaiyah/ba.mp3' WHERE challenge_id = 1006 AND text = 'ب';
UPDATE public.challenge_options SET audio_src = '/audio/materi/hijaiyah/shin.mp3' WHERE challenge_id = 1006 AND text = 'ش';

-- Q7 (1007) words
UPDATE public.challenge_options SET audio_src = '/audio/materi/idzhar/man-amila.mp3' WHERE challenge_id = 1007 AND text = 'مَنْ عَمِلَ';
UPDATE public.challenge_options SET audio_src = '/audio/materi/idzhar/man-yaqulu.mp3' WHERE challenge_id = 1007 AND text = 'مَنْ يَقُولُ';
UPDATE public.challenge_options SET audio_src = '/audio/materi/idzhar/man-nasara.mp3' WHERE challenge_id = 1007 AND text = 'مَنْ نَصَرَ';
UPDATE public.challenge_options SET audio_src = '/audio/materi/idzhar/man-yarham.mp3' WHERE challenge_id = 1007 AND text = 'مَنْ يَرْحَمْ';

-- Q9 (1009) hijaiyah
UPDATE public.challenge_options SET audio_src = '/audio/materi/hijaiyah/kha.mp3' WHERE challenge_id = 1009 AND text = 'خ';
UPDATE public.challenge_options SET audio_src = '/audio/materi/hijaiyah/nun.mp3' WHERE challenge_id = 1009 AND text = 'ن';
UPDATE public.challenge_options SET audio_src = '/audio/materi/hijaiyah/mim.mp3' WHERE challenge_id = 1009 AND text = 'م';
UPDATE public.challenge_options SET audio_src = '/audio/materi/hijaiyah/fa.mp3' WHERE challenge_id = 1009 AND text = 'ف';

-- Q12 (1012) hijaiyah
UPDATE public.challenge_options SET audio_src = '/audio/materi/hijaiyah/alif.mp3' WHERE challenge_id = 1012 AND text = 'ا';
UPDATE public.challenge_options SET audio_src = '/audio/materi/hijaiyah/ghain.mp3' WHERE challenge_id = 1012 AND text = 'غ';
UPDATE public.challenge_options SET audio_src = '/audio/materi/hijaiyah/ha.mp3' WHERE challenge_id = 1012 AND text = 'ح';
UPDATE public.challenge_options SET audio_src = '/audio/materi/hijaiyah/haa.mp3' WHERE challenge_id = 1012 AND text = 'هـ';

-- Q13 (1013) hijaiyah
UPDATE public.challenge_options SET audio_src = '/audio/materi/hijaiyah/kha.mp3' WHERE challenge_id = 1013 AND text = 'خ';
UPDATE public.challenge_options SET audio_src = '/audio/materi/hijaiyah/ghain.mp3' WHERE challenge_id = 1013 AND text = 'غ';
UPDATE public.challenge_options SET audio_src = '/audio/materi/hijaiyah/ha.mp3' WHERE challenge_id = 1013 AND text = 'ح';
UPDATE public.challenge_options SET audio_src = '/audio/materi/hijaiyah/ain.mp3' WHERE challenge_id = 1013 AND text = 'ع';

-- Q15 (1015) words
UPDATE public.challenge_options SET audio_src = '/audio/materi/idzhar/an-amta.mp3' WHERE challenge_id = 1015 AND text = 'أَنْعَمْتَ';
UPDATE public.challenge_options SET audio_src = '/audio/materi/idzhar/man-yaqulu.mp3' WHERE challenge_id = 1015 AND text = 'مَنْ يَقُولُ';
UPDATE public.challenge_options SET audio_src = '/audio/materi/idzhar/man-nur.mp3' WHERE challenge_id = 1015 AND text = 'مَنْ نُورٍ';
UPDATE public.challenge_options SET audio_src = '/audio/materi/idzhar/man-wara-ihim.mp3' WHERE challenge_id = 1015 AND text = 'مَنْ وَرَائِهِمْ';

-- Done.
