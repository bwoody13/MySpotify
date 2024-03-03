import { NavLink, useLocation } from 'react-router-dom';
import User from '../Classes/User';
import { retreiveAlbums, retreivePlaylists, syncAlbumsWithBackend, syncPlaylistsWithBackend } from '../utils/data_management';
import { useAlbums } from '../contexts/AlbumContext';
import { useLoading } from '../contexts/LoadingContext';
import { usePlaylists } from '../contexts/PlaylistContext';
import CreatePlaylist from './Playlists/CreatePlaylist';
import { PlaylistDisplay } from '../Classes/Playlist';

const getActiveLinkClass = ({ isActive }: { isActive: boolean }) => isActive ? 'active' : '';

const Sidebar: React.FC = () => {
    const { pathname } = useLocation();
    const { setAlbums } = useAlbums();
    const { setLoading } = useLoading();
    const { playlists, setPlaylists } = usePlaylists();
    let userLS = localStorage.getItem('user');
    const user: User | null = userLS ? JSON.parse(userLS) : null;

    if (pathname === '/')
        return <div className="sidebar bg-dark">
            <p className='user-name'>Log in to view sidebar content.</p>
        </div>

    function handleAlbumUpdate() {
        setLoading(true);
        try {
            syncAlbumsWithBackend().then(() => retreiveAlbums().then(albumsData => {
                    setAlbums(albumsData);
                    setLoading(false);
                }));
        } catch (error) {
            console.error('Error updating albums:', error);
            setLoading(false);    
        }
    };

    function handlePlaylistUpdate() {
        setLoading(true);
        try {
            syncPlaylistsWithBackend().then(() => retreivePlaylists().then(playlistData => {
                setPlaylists(playlistData);
                setLoading(false);
            }));
        } catch (error) {
            console.error('Error updating playlists:', error);
            setLoading(false);
        }
    };

    function addPlaylist(playlist: PlaylistDisplay) {
        setPlaylists([...playlists, playlist]);
    }

    function handleUpdateLibrary() {
        setLoading(true)
        try {
            Promise.all([syncAlbumsWithBackend(), syncPlaylistsWithBackend()]).then(() => {
                Promise.all([retreiveAlbums(), retreivePlaylists()]).then(([albumsData, playlistData]) => {
                  setAlbums(albumsData);
                  setPlaylists(playlistData);
                  setLoading(false);
                });
              });
        } catch (error) {
            console.error('Error updating library:', error);
            setLoading(false)
        }
    }

    return (
        <div className="sidebar bg-dark">
            {/* Display user info if logged in */}
            {user && (
                <div className="user-info">
                    <img src={user.images.length > 0 ? (user.images[0].url.length > 0 ? user.images[0].url : "https://dev.acquia.com/sites/default/files/styles/coh_small_square/public/images/2023-07/GenericUserAvatar.png.webp?itok=NpTeGe9Y") : "https://dev.acquia.com/sites/default/files/styles/coh_small_square/public/images/2023-07/GenericUserAvatar.png.webp?itok=NpTeGe9Y"} alt="User" className="user-profile-img" />
                    <br/>
                    <p className="user-name">{user.display_name}</p>
                </div>
            )}
            {pathname === '/dashboard' && <>
                <button className='p-2 mb-2' onClick={handleUpdateLibrary}>Update Library</button>
            </>}
            {pathname === "/dashboard/album" && (<>
                <button className='p-2 mb-2' onClick={handleAlbumUpdate}>Update Albums</button>
                <hr/>
                <a href="#randomizer">Album Randomizer</a>
                <a href="#recommender">Album Recommender</a>
            </>)}
            {pathname === "/dashboard/playlist" && (<>
                <button className='p-2 mb-2' onClick={handlePlaylistUpdate}>Update Playlists</button>
                <CreatePlaylist addPlaylist={addPlaylist} />
                <hr/>
                {/* <a href='#create'>Create Playlist</a> */}
                <a href='#enhancer'>Enhance Playlist</a>
                <a href='#recommender'>Recommend New Playlist</a>
                <a href='#smart'>Smart Playlists</a>
                <a href='#created-sp'>Created Smart Playlists</a>
            </>)}
            <hr/>
            <NavLink to="/dashboard" className={getActiveLinkClass}>Dashboard</NavLink>
            {/* Conditional Links based on current route */}
            

            {/* Additional conditional content can be added similarly */}
            <NavLink to="/" className={getActiveLinkClass}>Login to New User</NavLink>
        </div>
    );
};

export default Sidebar;
