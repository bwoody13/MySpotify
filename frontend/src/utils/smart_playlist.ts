import SmartPlaylist, { ChildPlaylist } from "../Classes/SmartPlaylist";
import { syncSmartPlaylistData } from "./backend_api_handler";
import { addTracksToPlaylist, getPlaylistTracks, removeTracksFromPlaylist } from "./spotify_api_handler";

export async function syncSmartPlaylist(smartPlaylist: SmartPlaylist, keepUnmatchedTracks: boolean = true) {
    const parent_playlist_id = smartPlaylist.parent_playlist.id;
    const parentTracks = new Set<String>(await getPlaylistTracks(parent_playlist_id));

    let childPlaylists = smartPlaylist.children;
    if (keepUnmatchedTracks) {
        childPlaylists = getOutOfSyncChildren(childPlaylists);
    }

    const childrenTracks = new Set<String>();
    for (const childPlaylistId of childPlaylists.map(childPlaylist => childPlaylist.playlist.id)) {
        const childTracks = await getPlaylistTracks(childPlaylistId);
        childTracks.map((track) => childrenTracks.add(track));
    }

    const tracksToAdd = [...childrenTracks].filter(track => !parentTracks.has(track));
    addTracksToPlaylist(parent_playlist_id, tracksToAdd);
    
    if (!keepUnmatchedTracks) {
        const tracksToRemove = [...parentTracks].filter(track => !childrenTracks.has(track));
        removeTracksFromPlaylist(parent_playlist_id, tracksToRemove);
    }

    const smartPlaylistSyncData = {
        parent_playlist_id: parent_playlist_id,
        children: childPlaylists.map(childPlaylist => ({child_playlist_id: childPlaylist.playlist.id, snapshot_id: childPlaylist.playlist.snapshot_id})),
    }
    await syncSmartPlaylistData(smartPlaylistSyncData)
}

function getOutOfSyncChildren(childPlaylists: ChildPlaylist[]): ChildPlaylist[] {
    return childPlaylists.filter((childPlaylist) => childPlaylist.playlist.snapshot_id != childPlaylist.last_sync_snapshot_id)
}
