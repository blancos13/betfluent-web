import React from 'react';
import Divider from 'material-ui/Divider';
import Carousel from 'react-multi-carousel';
import 'react-multi-carousel/lib/styles.css';
import LobbyCard from './LobbyCard';
import './ManagerRow.css';

const calcItems = ({ size, count }) => {
    const poolWidth = 352;
    const poolContainerWidth = size - 660;
    return Math.min(count, Math.floor(poolContainerWidth / poolWidth));
}

const ManagerRow = ({ manager, user, size }) => {
    const responsive = {
        desktop: {
          breakpoint: { max: 3000, min: 1024 },
          items: calcItems({ size, count: manager.funds.length })
        },
        tablet: {
          breakpoint: { max: 1024, min: 624 },
          items: calcItems({ size, count: manager.funds.length })
        },
        mobile: {
          breakpoint: { max: 624, min: 0 },
          items: 1
        }
    };

    return (
        <React.Fragment>
            <div className="manager-wrapper">
                <div className="manager-details">
                    <img className="manager-avatar" src={manager.avatarUrl} />
                    <div className="manager-content">
                        <div className="manager-name">{manager.name}</div>
                        <div className="manager-follow">FOLLOW +</div>
                        <div className="manager-followers">{`${manager.followers || 0} Followers`}</div>
                        <div className="manager-performance">{`Recent Performance`}</div>
                    </div>
                </div>
                <div className="pool-wrapper">
                    <Carousel responsive={responsive} containerClass="carousel-container" itemClass="carousel-item" autoPlay={false}>
                        {manager.funds && manager.funds.map((fund, i) => (
                            <LobbyCard key={i} fund={fund} user={user} />
                        ))}
                    </Carousel>
                </div>
            </div>
            <Divider />
        </React.Fragment>
    )
}

export default ManagerRow;