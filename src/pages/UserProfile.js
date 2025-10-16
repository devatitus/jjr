import React, { useState, useEffect } from "react";
import "../styles/UserProfile.css";
import { QRCodeCanvas } from "qrcode.react";
import {
  LocateFixed,
  MapPinPlus,
  ScanQrCode
} from "lucide-react";
import userData from "../data/user.json";
import postData from "../data/post.json"; // import static posts

const UserProfile = () => {
  const [posts, setPosts] = useState([]);
  const [user, setUser] = useState({});
  const [showQR, setShowQR] = useState(false);
  const [searchQuery] = useState("");
  const [activeTab] = useState("posts");

  useEffect(() => {
    setUser(userData);
    setPosts(postData); // load posts from post.json
  }, []);

  const convertToDMS = (lat, lng) => {
    const toDMS = (deg, isLat) => {
      const absolute = Math.abs(deg);
      const degrees = Math.floor(absolute);
      const minutes = Math.floor((absolute - degrees) * 60);
      const seconds = (((absolute - degrees) * 60 - minutes) * 60).toFixed(1);
      const direction = deg >= 0 ? (isLat ? "N" : "E") : (isLat ? "S" : "W");
      return `${degrees}°${String(minutes).padStart(2, "0")}'${String(seconds).padStart(4, "0")}"${direction}`;
    };
    return `${toDMS(lat, true)} ${toDMS(lng, false)}`;
  };

  const handleSaveLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          const mapCoords = convertToDMS(lat, lng);
          setUser({ ...user, location: mapCoords });
          alert("Location saved!");
        },
        () => alert("Unable to access your location.")
      );
    } else {
      alert("Geolocation not supported.");
    }
  };

  const handleViewLocation = () => {
    if (!user.location) {
      return alert("No saved location found.");
    }

    // Convert DMS to Decimal Degrees
    const DMSToDecimal = (dms) => {
      const regex = /(\d+)°(\d+)'([\d.]+)"([NSEW])/;
      const match = dms.match(regex);
      if (!match) return 0;

      let degrees = parseInt(match[1]);
      let minutes = parseInt(match[2]);
      let seconds = parseFloat(match[3]);
      const direction = match[4];

      let decimal = degrees + minutes / 60 + seconds / 3600;
      if (direction === "S" || direction === "W") decimal *= -1;

      return decimal;
    };

    const [latDMS, lngDMS] = user.location.split(" ");
    const latDecimal = DMSToDecimal(latDMS);
    const lngDecimal = DMSToDecimal(lngDMS);

    const mapUrl = `https://www.google.com/maps/dir/?api=1&destination=${latDecimal},${lngDecimal}`;
    window.open(mapUrl, "_blank");
  };


  const getStartMinutes = (timingStr) => {
    if (!timingStr) return 9999;
    const match = timingStr.match(/(\d{1,2}):(\d{2}) (AM|PM)/i);
    if (!match) return 9999;
    let hours = parseInt(match[1]);
    const minutes = parseInt(match[2]);
    const period = match[3].toUpperCase();
    if (period === "PM" && hours !== 12) hours += 12;
    if (period === "AM" && hours === 12) hours = 0;
    return hours * 60 + minutes;
  };

  return (
    <div className="user-container">
      {/* QR CODE VIEW */}
      {/* QR CODE VIEW */}
      {showQR && (
        <div className="qr-popup-overlay" onClick={() => setShowQR(false)}>
          <div className="qr-popup-box" onClick={(e) => e.stopPropagation()}>
            <div id="qr-code-to-print" style={{ padding: '10px' }}>
              <QRCodeCanvas
                value={`${window.location.origin}`} // updated link
                size={180}
              />
              <p style={{ marginTop: "10px", fontWeight: "bold" }}>
                {user.username}'s QR Code
              </p>
              <div className="qr-btn">
                <button className="qrcancel-btn" onClick={() => setShowQR(false)}>Cancel</button>
                <button
                  className="qrshare-btn"
                  onClick={async () => {
                    const canvas = document.querySelector("#qr-code-to-print canvas");
                    if (!canvas) return alert("QR code not found.");

                    canvas.toBlob(async (blob) => {
                      if (!blob) return alert("Failed to generate QR code image.");
                      const file = new File([blob], `${user.username}-qrcode.png`, { type: blob.type });

                      if (navigator.canShare && navigator.canShare({ files: [file] })) {
                        try {
                          await navigator.share({
                            title: `${user.username}'s Profile QR`,
                            text: `Scan this QR to view ${user.username}'s profile`,
                            files: [file],
                          });
                        } catch (error) {
                          console.error("Sharing failed", error);
                        }
                      } else {
                        // fallback: download
                        const url = URL.createObjectURL(blob);
                        const link = document.createElement("a");
                        link.href = url;
                        link.download = `${user.username}-qrcode.png`;
                        link.click();
                        URL.revokeObjectURL(url);
                        alert("QR code downloaded (sharing not supported).");
                      }
                    });
                  }}
                >
                  Share
                </button>
                <button className="qrsave-btn" onClick={() => {
                  const printContents = document.getElementById("qr-code-to-print").innerHTML;
                  const printWindow = window.open('', '', 'height=500,width=500');
                  printWindow.document.write('<html><head><title>Print QR Code</title></head><body>');
                  printWindow.document.write(printContents);
                  printWindow.document.write('</body></html>');
                  printWindow.document.close();
                  printWindow.print();
                }}>Print</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* BACKGROUND IMAGE */}
      <img src={user.background} alt="Background" className="user-background" />
      <div className="profile-container">
        <img src={user.profile} alt="Profile" className="user-profile" />
      </div>

      {/* USER DETAILS */}
      <div className="user-info">
        <h1 className="user-name">{user.username}</h1>
        <p className="user-availability">{user.availability}</p>
        <div className="locater">
          <button className="qrcodedesign" onClick={() => setShowQR(!showQR)}><ScanQrCode size={20} /></button>
          <button onClick={handleViewLocation} className="location-button" title="View Direction"><LocateFixed size={20} /></button>
          <button className="view-location-btn" onClick={handleSaveLocation} title="Save Current Location"><MapPinPlus size={20} /></button>
          {user.phone && (<button className="SmartNum-button" onClick={() => { window.location.href = `tel:${user.phone}`; }} title={`Call ${user.username}`}>📞</button>)}
        </div>
      </div>

      {/* MENU SECTION */}
      {activeTab === "posts" && (
        <div className="posts-section">
          <div className="button-container">
            <div className="m1"><h1> MENU </h1></div>
          </div>
          {[...posts]
            .filter(post =>
              (post.name && post.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
              (post.timing && post.timing.toLowerCase().includes(searchQuery.toLowerCase())) ||
              (post.price && post.price.toLowerCase().includes(searchQuery.toLowerCase()))
            )
            .sort((a, b) => getStartMinutes(a.timing) - getStartMinutes(b.timing))
            .map((post) => (
              <div key={post.id} className="post-post">
                <img src={post.image} alt={post.name} className="post-image" />
                <div className="post-details">
                  <div className="post-header">
                    <input type="text" value={post.name} className="post-name" readOnly />
                    <input type="text" value={`Rs:${post.price}`} className="post-price" readOnly />
                    {post.timing && <input type="text" value={post.timing} className="post-timing" readOnly />}
                  </div>
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  );
};

export default UserProfile;
