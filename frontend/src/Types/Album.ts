type Album = {
    id: string;
    name: string;
    images: Image[];
    type: string;
    artists: {id: string, name: string}[];
    tracks: any[];
    genres: string[];
};

