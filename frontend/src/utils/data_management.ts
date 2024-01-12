import { getAlbums, getUser, updateAlbums, updatePlaylists, getPlaylists as getPlaylistsDB } from "./backend_api_handler";
import { getLikedAlbums, getPlaylists } from "./spotify_api_handler";

const AUTO_SYNC_TIME = 1000 * 60 * 60 * 24 * 2; // 2 days

export async function syncAlbumsWithBackend() {
    return getLikedAlbums().then((albums) => updateAlbums(albums));
}

export async function syncPlaylistsWithBackend() {
    return getPlaylists().then((playlists) => updatePlaylists(playlists));
}

export async function retreiveAlbums() {
    const user = await getUser();
    if (user.album_sync_date.getTime() + AUTO_SYNC_TIME < Date.now()) {
        await syncAlbumsWithBackend();
    }
    return getAlbums();
}

export async function retreivePlaylists() {
    const user = await getUser();
    if (user.playlist_sync_date.getTime() + AUTO_SYNC_TIME < Date.now()) {
        await syncPlaylistsWithBackend();
    }
    return getPlaylistsDB();
}