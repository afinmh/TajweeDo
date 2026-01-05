"use client";

import { Pause, Play, Search } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

type Prayer = {
  id: string;
  title: string;
  arabic: string;
  latin: string;
  translation: string;
  audio: string;
};

const prayers: Prayer[] = [
  {
    id: "1",
    title: "Belajar",
    arabic: "رَبِّ زِدْنِي عِلْمًا، وَارْزُقْنِيْ فَهْمًا",
    latin: "Robbi zidnii ‘ilmaa, warzuqnii fahmaa",
    translation: "Ya Tuhanku, tambahkanlah ilmu kepadaku, dan berilah aku karunia untuk dapat memahaminya",
    audio: "/audio/doa/1_belajar.mp3",
  },
  {
    id: "2",
    title: "Tidur",
    arabic: "بِسْمِكَ االلّٰهُمَّ اَحْيَا وَبِاسْمِكَ اَمُوْتُ",
    latin: "Bismikallaahuma ahyaa wa bismika amuutu",
    translation: "Dengan menyebut nama-Mu, Ya Allah, aku hidup dan dengan menyebut nama-Mu aku mati",
    audio: "/audio/doa/2_tidur.mp3",
  },
  {
    id: "3",
    title: "Bangun Tidur",
    arabic: "اَلْحَمْدُ لِلّٰهِ الَّذِىْ اَحْيَانَا بَعْدَمَآ اَمَاتَنَا وَاِلَيْهِ النُّشُوْرُ",
    latin: "Alhamdu lillahil ladzii ahyaanaa ba'da maa amaa tanaa wa ilahin nusyuur",
    translation: "Segala puji bagi Allah yang telah menghidupkan kami sesudah kami mati dan hanya kepada-Nya kami dikembalikan",
    audio: "/audio/doa/3_bangun_tidur.mp3",
  },
  {
    id: "4",
    title: "Makan",
    arabic: "اَللّٰهُمَّ بَارِكْ لَنَا فِيْمَا رَزَقْتَنَا وَقِنَا عَذَابَ النَّارِ",
    latin: "Alloohumma barik lanaa fiimaa razaqtanaa waqinaa 'adzaa bannar",
    translation: "Ya Allah, berkahilah kami dalam rezeki yang telah Engkau limpahkan kepada kami dan jauhkanlah kami dari siksa neraka",
    audio: "/audio/doa/4_makan.mp3",
  },
  {
    id: "5",
    title: "Setelah Makan",
    arabic: "اَلْحَمْدُ ِللهِ الَّذِىْ اَطْعَمَنَا وَسَقَانَا وَجَعَلَنَا مُسْلِمِيْنَ",
    latin: "Alhamdu lillaahil ladzii ath'amanaa wa saqoonaa wa ja'alanaa minal muslimiin",
    translation: "Segala puji bagi Allah yang telah memberi kami makan dan minum, serta menjadikan kami termasuk golongan muslim",
    audio: "/audio/doa/5_sesudah_makan.mp3",
  },
  {
    id: "6",
    title: "Masuk WC",
    arabic: "اَللّٰهُمَّ اِنّىْ اَعُوْذُبِكَ مِنَ الْخُبُثِ وَالْخَبَآئِثِ",
    latin: "Alloohumma Innii a'uudzubika minal khubutsi wal khoaaitsi",
    translation: "Ya Allah, aku berlindung pada-Mu dari godaan setan laki-laki dan setan perempuan",
    audio: "/audio/doa/6_masuk_wc.mp3",
  },
  {
    id: "7",
    title: "Keluar WC",
    arabic: "الْحَمْدُ ِللهِ الَّذِىْ اَذْهَبَ عَنِّى اْلاَذَى وَعَافَانِىْ",
    latin: "Alhamdulillaahil ladzii adzhaba 'annil adzaa wa'aafaanii",
    translation: "Segala puji milik Allah yang telah menghilangkan kotoran dari badanku dan menyejahterakan",
    audio: "/audio/doa/7_keluar_wc.mp3",
  },
  {
    id: "8",
    title: "Masuk Rumah",
    arabic: "أَسَّلَامُ عَلَيْنَا وَعَلَى عِبَادِ اللَّهِ الصَّالِحِينَ",
    latin: "Assalaamu 'alainaa wa 'alaa 'ibaadillaahish shoolihiin",
    translation: "Semoga keselamatan atas kita, hamba-hamba Allah yang shalih",
    audio: "/audio/doa/8_masuk_rumah.mp3",
  },
  {
    id: "9",
    title: "Keluar Rumah",
    arabic: "بِسْمِ اللهِ تَوَكَّلْتُ عَلَى اللهِ لاَحَوْلَ وَلاَقُوَّةَ اِلاَّ بِالله",
    latin: "Bismillaahi tawakkaltu 'alalloohi laa hawlaa walaa quwwata illaa bilaahi",
    translation: "Dengan menyebut nama Allah aku bertawakal kepada Allah, tiada daya kekuatan melainkan pertolongan Allah",
    audio: "/audio/doa/9_keluar_rumah.mp3",
  },
  {
    id: "10",
    title: "Masuk Masjid",
    arabic: "اَللّٰهُمَّ افْتَحْ لِيْ اَبْوَابَ رَحْمَتِكَ",
    latin: "Allahummaf tahlii abwaaba rohmatik",
    translation: "Ya Allah, bukalah untukku pintu-pintu rahmat-Mu",
    audio: "/audio/doa/10_masuk_mesjid.mp3",
  },
  {
    id: "11",
    title: "Keluar Masjid",
    arabic: "اَللّٰهُمَّ اِنِّى اَسْأَلُكَ مِنْ فَضْلِكَ",
    latin: "Allahumma innii asaluka min fadlik",
    translation: "Ya Allah, sesungguhnya aku memohon keutamaan dari-Mu",
    audio: "/audio/doa/11_keluar_mesjid.mp3",
  },
  {
    id: "12",
    title: "Kedua Orang Tua",
    arabic: "اَللّٰهُمَّ اغْفِرْلِيْ وَلِوَالِدَيَّ وَارْحَمْهُمَاكَمَارَبَّيَانِيْ صَغِيْرَا",
    latin: "Alloohummaghfirlii waliwaalidayya warham humma kamaa rabbayaa nii shaghiiraa",
    translation: "Wahai Tuhanku, ampunilah aku dan kedua orang tuaku, sayangilah mereka sebagaimana mereka menyayangiku saat kecil",
    audio: "/audio/doa/12_orangtua.mp3",
  },
  {
    id: "13",
    title: "Berpakaian",
    arabic: "اللهِ اَللّٰهُمَّ اِنِّى اَسْأَلُكَ مِنْ خَيْرِهِ وَخَيْرِ مَاهُوَ لَهُ وَاَعُوْذُبِكَ مِنْ شَرِّهِ وَشَرِّمَا هُوَلَهُ",
    latin: "Alloohumma innii as-aluka min khoirihi wa khoiri maa huwa lahuu wa'a'uu dzubika min syarrihi wa syarri maa huwa lahuu",
    translation: "Ya Allah aku minta kepada-Mu kebaikan pakaian ini dan apa yang ada padanya, dan berlindung dari keburukannya",
    audio: "/audio/doa/13_berpakaian.mp3",
  },
  {
    id: "14",
    title: "Bercermin",
    arabic: "اَلْحَمْدُ ِللهِ كَمَا حَسَّنْتَ خَلْقِىْ  فَحَسِّـنْ خُلُقِىْ",
    latin: "Alhamdulillaahi kamaa hassanta kholqii fahassin khuluqii",
    translation: "Segala puji bagi Allah, baguskanlah budi pekertiku sebagaimana Engkau membaguskan rupa wajahku",
    audio: "/audio/doa/14_bercermin.mp3",
  },
  {
    id: "15",
    title: "Berkendara",
    arabic: "سُبْحَانَ الَّذِىْ سَخَّرَلَنَا هَذَا وَمَاكُنَّالَهُ مُقْرِنِيْنَ وَاِنَّآ اِلَى رَبِّنَا لَمُنْقَلِبُوْنَ",
    latin: "Subhaanalladzii sakkhara lanaa hadza wama kunna lahu muqriniin wa-inna ilaa rabbina lamunqalibuun",
    translation: "Maha suci Allah yang menundukkan kendaraan ini, sebelumnya kami tak mampu, dan hanya kepada-Nya kami kembali",
    audio: "/audio/doa/15_berkendara.mp3",
  },
  {
    id: "16",
    title: "Saat Hujan",
    arabic: "اللَّهُمَّ صَيِّبًا هَنِيًّا وَسَيِّبًا نَافِعًا",
    latin: "Allâhumma shayyiban haniyyâ wa sayyiban nâfi‘â",
    translation: "Wahai Tuhanku, jadikanlah hujan ini terpuji kesudahannya dan bermanfaat",
    audio: "/audio/doa/16_hujan.mp3",
  },
];

export default function QuestsMenu() {
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const audioEl = audioRef.current;
    return () => {
      if (audioEl) {
        audioEl.pause();
      }
    };
  }, []);

  const filteredPrayers = useMemo(() => {
    if (!searchQuery.trim()) return prayers;
    const query = searchQuery.toLowerCase();
    return prayers.filter(
      (p) =>
        p.title.toLowerCase().includes(query) ||
        p.latin.toLowerCase().includes(query) ||
        p.translation.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  const handleToggle = (prayer: Prayer) => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.addEventListener("ended", () => setCurrentId(null));
    }

    const audioEl = audioRef.current;

    if (currentId === prayer.id) {
      audioEl.pause();
      audioEl.currentTime = 0;
      setCurrentId(null);
      return;
    }

    audioEl.src = prayer.audio;
    audioEl.play();
    setCurrentId(prayer.id);
  };

  return (
    <div className="flex flex-col gap-4 w-full max-w-3xl">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
        <input
          type="text"
          placeholder="Cari doa..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-12 pr-4 py-3 border rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent"
        />
      </div>

      {filteredPrayers.length === 0 && (
        <div className="text-center py-8 text-slate-500">
          Tidak ada doa yang ditemukan
        </div>
      )}

      {filteredPrayers.map((prayer) => (
        <div
          key={prayer.id}
          className="border rounded-xl p-4 sm:p-5 bg-white shadow-sm hover:shadow-md transition"
        >
          <div className="flex flex-col gap-4">
            {/* Header dengan judul dan tombol play */}
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-base sm:text-lg font-bold text-emerald-700">
                Doa {prayer.title}
              </h3>
              <button
                type="button"
                aria-label={currentId === prayer.id ? "Hentikan audio" : "Putar audio"}
                onClick={() => handleToggle(prayer)}
                className="h-11 w-11 sm:h-12 sm:w-12 flex-shrink-0 rounded-full border-2 flex items-center justify-center bg-emerald-50 text-emerald-600 hover:bg-emerald-100 hover:border-emerald-400 active:scale-95 transition"
              >
                {currentId === prayer.id ? (
                  <Pause className="h-5 w-5" />
                ) : (
                  <Play className="h-5 w-5 ml-0.5" />
                )}
              </button>
            </div>

            {/* Tulisan Arab */}
            <div className="bg-emerald-50/50 rounded-lg p-3 sm:p-4">
              <p className="text-right text-xl sm:text-2xl leading-loose sm:leading-relaxed font-arabic">
                {prayer.arabic}
              </p>
            </div>

            {/* Latin */}
            <p className="text-sm sm:text-base font-medium text-slate-700 italic leading-relaxed">
              {prayer.latin}
            </p>

            {/* Terjemahan */}
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              {prayer.translation}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
