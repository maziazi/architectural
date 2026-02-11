export type MaterialType = 'Beton' | 'Baja' | 'Kayu' | 'Bata';

export interface MaterialDetail {
    id: string;
    name: string;
    type: MaterialType;
    spanRange: string;
    depth: string;
    description: string;
    characteristics: string[];
    suitableFor: string[];
    limitations: string[];
    imageUrl?: string;
}

export const materialCategories = [
    {
        id: 'concrete',
        name: 'Beton',
        image: require('@/assets/images/materials/concrete.jpg'),
        description: 'Beton bertulang kuat terhadap beban tekan cocok untuk kolom dan pelat pada bangunan bertingkat.',
    },
    {
        id: 'steel',
        name: 'Baja',
        image: require('@/assets/images/materials/steel.jpg'),
        description: 'Baja memberikan rasio kekuatan-berat tinggi ideal untuk bentang panjang dan struktur prefabrikasi.',
    },
    {
        id: 'wood',
        name: 'Kayu',
        image: require('@/assets/images/materials/timber.jpeg'),
        description: 'Kayu ringan dan estetis cocok untuk struktur modular ringan dan ruang dengan fokus estetika.',
    },
    {
        id: 'brick',
        name: 'Bata',
        image: require('@/assets/images/materials/masonry.jpeg'),
        description: 'Pasangan bata tekstural dan ekonomis ideal untuk penggunaan struktural, perhatikan ketebalan dan sambungan.',
    },
];

export const materialsData: MaterialDetail[] = [
    // Concrete (Beton)
    {
        id: 'beton-bertulang',
        name: 'Beton Bertulang',
        type: 'Beton',
        spanRange: '6m - 12m',
        depth: 'L/20 hingga L/24',
        description: 'Beton yang diperkuat dengan tulangan baja untuk menahan gaya tarik yang lemah pada beton biasa.',
        characteristics: [
            'Kuat tekan tinggi',
            'Tahan api',
            'Dapat dibentuk sesuai cetakan',
            'Memerlukan waktu curing',
        ],
        suitableFor: [
            'Kolom gedung bertingkat',
            'Balok induk',
            'Pelat lantai',
            'Pondasi',
        ],
        limitations: [
            'Berat sendiri besar',
            'Lemah terhadap gaya tarik tanpa tulangan',
            'Proses konstruksi basah dan lama',
        ],
    },
    {
        id: 'beton-prategang',
        name: 'Beton Prategang',
        type: 'Beton',
        spanRange: '10m - 20m+',
        depth: 'L/25 hingga L/30',
        description: 'Beton yang diberikan tegangan tekan internal sebelum menerima beban eksternal untuk meningkatkan kapasitas bentang.',
        characteristics: [
            'Kapasitas bentang lebih panjang',
            'Dimensi elemen lebih ramping',
            'Retak lebih terkontrol',
        ],
        suitableFor: [
            'Jembatan bentang panjang',
            'Pelat lantai bentang lebar',
            'Balok girder',
        ],
        limitations: [
            'Memerlukan tenaga ahli khusus',
            'Biaya awal lebih tinggi',
            'Perlu peralatan khusus untuk penarikan kabel',
        ],
    },

    // Steel (Baja)
    {
        id: 'w-section',
        name: 'Baja Profil W (Wide Flange)',
        type: 'Baja',
        spanRange: '8m - 15m',
        depth: 'L/20 hingga L/25',
        description: 'Profil baja dengan sayap lebar yang sangat efisien menahan momen lentur pada balok dan kolom.',
        characteristics: [
            'Rasio kekuatan terhadap berat tinggi',
            'Presisi geometris tinggi',
            'Kecepatan konstruksi tinggi',
        ],
        suitableFor: [
            'Rangka portal gedung',
            'Balok lantai mezzanine',
            'Kolom struktur baja',
        ],
        limitations: [
            'Rentan terhadap korosi',
            'Kehilangan kekuatan pada suhu tinggi (kebakaran)',
            'Perlu perawatan cat/galvanis',
        ],
    },
    {
        id: 'hollow-section',
        name: 'Pipa Baja (HSS)',
        type: 'Baja',
        spanRange: '4m - 10m',
        depth: 'L/15 hingga L/20',
        description: 'Penampang baja berongga (Hollow Structural Section) berbentuk persegi atau bulat, efisien terhadap puntir dan tekan.',
        characteristics: [
            'Estetika bersih (tanpa sudut tajam)',
            'Tahanan torsi sangat baik',
            'Permukaan minimal untuk pengecatan',
        ],
        suitableFor: [
            'Kolom ekspose',
            'Rangka atap truss',
            'Fasad bangunan',
        ],
        limitations: [
            'Sambungan lebih rumit dibanding profil terbuka',
            'Biaya material per kg bisa lebih tinggi',
        ],
    },

    // Wood (Kayu)
    {
        id: 'glulam',
        name: 'Glulam (Glued Laminated Timber)',
        type: 'Kayu',
        spanRange: '6m - 30m',
        depth: 'L/15 hingga L/20',
        description: 'Produk kayu rekayasa yang dibuat dengan merekatkan lapisan kayu dimensi dengan perekat tahan air yang kuat.',
        characteristics: [
            'Dapat dibuat melengkung',
            'Dimensi bisa sangat besar',
            'Tampilan estetika natural',
            'Lebih stabil dibanding kayu solid',
        ],
        suitableFor: [
            'Balok bentang lebar',
            'Rangka atap ekspose',
            'Jembatan pejalan kaki',
            'Glulam Frames',
        ],
        limitations: [
            'Perlu perlindungan dari cuaca ekstrem',
            'Biaya lebih tinggi dibanding kayu gergajian biasa',
        ],
    },
    {
        id: 'clt',
        name: 'CLT (Cross Laminated Timber)',
        type: 'Kayu',
        spanRange: '4m - 8m',
        depth: 'L/20 hingga L/30',
        description: 'Panel kayu masif yang terdiri dari lapisan papan kayu yang direkatkan tegak lurus satu sama lain.',
        characteristics: [
            'Stabilitas dimensi tinggi',
            'Berfungsi sebagai elemen dinding dan lantai sekaligus',
            'Isolasi termal dan akustik baik',
        ],
        suitableFor: [
            'CLT Panels',
            'Dinding geser',
            'Lantai prefabrikasi',
            'Konstruksi bangunan tinggi kayu',
        ],
        limitations: [
            'Berat panel memerlukan crane',
            'Detail sambungan harus presisi',
            'Sensitif terhadap kelembaban selama konstruksi',
        ],
    },

    // Masonry (Bata)
    {
        id: 'bata-merah',
        name: 'Bata Merah Solid',
        type: 'Bata',
        spanRange: '2m - 4m (sebagai balok lengkung)',
        depth: 'N/A (Dinding)',
        description: 'Material pasangan dinding konvensional dari tanah liat yang dibakar.',
        characteristics: [
            'Tahan api sangat baik',
            'Massa termal tinggi',
            'Menyerap suara',
        ],
        suitableFor: [
            'Dinding pengisi',
            'Struktur dinding pemikul beban sederhana',
            'Pagar',
        ],
        limitations: [
            'Kuat tekan rendah dibanding beton',
            'Tidak tahan gempa tanpa perkuatan',
            'Pengerjaan lambat',
        ],
    },
];
