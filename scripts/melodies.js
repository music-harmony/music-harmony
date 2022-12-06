var melodiesDatabase = [
    {
        name: 'Melody01',
        fifths: 0,
        beats: 4,
        beat_type: 4,
        chordsDuration: [4, 4, 4, 4, 4, 4, 4, 4],
        expectedChords: [[0,11,12],[0,1,13],[11,12,23],[0,1,13],[11,23],[0,12,13],[1,23],[0]]
    },
    {
        name: 'Melody02',
        fifths: 3,
        beats: 4,
        beat_type: 4,
        chordsDuration: [4, 4, 4, 4, 4, 4, 4, 4, 2, 2, 4],
        expectedChords: [[],[2,3,15],[2,3,15],[3,4,16],[2,3,15],[3,4,16],[4,16],[3,4,16],[2,14],[4,14],[3]]
    },
    { 
        name: 'Melody03',
        fifths: -3,
        beats: 4,
        beat_type: 4,
        chordsDuration: [4, 4, 8, 4, 4, 8, 4, 4, 4, 4],
        expectedChords: [[],[8,9,21],[9,10,22],[8,20,21],[9,10,22],[9,10,22],[8,9,21],[8,20,21],[8,20],[9]]
    },
    {
        name: 'Melody04',
        fifths: -4,
        beats: 6,
        beat_type: 8,
        chordsDuration: [3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 6],
        expectedChords: [[],[7,8,20],[8,20,21],[9,19],[7,19],[8,20,21],[8,20,21],[9,19],[9,19],[8,20,21],[8]]
    },
    {
        name: 'Melody05',
        fifths: 2,
        beats: 4,
        beat_type: 4,
        chordsDuration: [6, 2, 4, 4, 8, 8, 8, 8, 4, 4, 8],
        expectedChords: [[],[2,14,15],[1,13],[1,2,14],[3,13],[2,14,15],[1,2,14],[1,13],[3,13],[1,2,14],[2]]
    },
    {
        name: 'Melody06',
        fifths: 1,
        beats: 3,
        beat_type: 4,
        chordsDuration: [4, 2, 4, 2, 4, 2, 6, 4, 2, 4, 2, 4, 2, 6],
        expectedChords: [[1,2,14],[1,13,14],[1,2,14],[0,1,13],[0,12,13],[0,12,13],[0,1,13],[0,12],[1,13,14],[1,13,14],[2,12],[2,12],[0,1,13],[1]]
    },
    {
        name: 'Melody07',
        fifths: -5,
        beats: 4,
        beat_type: 4,
        chordsDuration: [6, 2, 8, 8, 8, 4, 4, 8],
        expectedChords: [[],[7,19,20],[6,18,19],[7,19,20],[6,18,19],[7,19,20],[8,18],[7]]
    },
    {
        name: 'Melody08',
        fifths: 1,
        beats: 4,
        beat_type: 4,
        chordsDuration: [6, 2, 6, 2, 2, 2, 4, 2, 6],
        expectedChords: [[],[1,2,14],[1],[2,14],[0,12,13],[0,12],[1,13],[2,12],[1]]
    },
    {
        name: 'Melody09',
        fifths: 0,
        beats: 4,
        beat_type: 4,
        chordsDuration: [6, 2, 8, 8, 8, 8, 8, 8, 8],
        expectedChords: [[],[0,1,13],[0,1,13],[1],[0,12,13],[0,11,12],[0,12,13],[1,23],[0]]
    },

];
