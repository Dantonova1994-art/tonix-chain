// TONIX Profile NFT Collection

import "@stdlib/deploy";
import "@stdlib/ownable";
import "@stdlib/nft-collection";

struct ProfileData {
    username: String;
    xp: Int as uint64;
    level: Int as uint8;
    badges: String[];
}

message MintProfile {
    to: Address;
    username: String;
    xp: Int as uint64;
    level: Int as uint8;
    badges: String[];
}

contract TONIXProfileCollection with Deployable, Ownable, NFTCollection {
    profiles: map<Int as uint64, ProfileData> = emptyMap();
    nextItemId: Int as uint64 = 1;
    
    init(owner: Address) {
        Ownable.init(owner);
        NFTCollection.init();
    }
    
    // Mint profile NFT
    receive(msg: MintProfile) {
        self.onlyOwner();
        
        let profile = ProfileData{
            username: msg.username,
            xp: msg.xp,
            level: msg.level,
            badges: msg.badges
        };
        
        self.profiles.set(self.nextItemId, profile);
        
        // Mint NFT
        self.mint(msg.to, self.nextItemId, "TONIX Profile");
        
        self.nextItemId = self.nextItemId + 1;
    }
    
    // Update profile (owner of NFT only)
    receive(msg: UpdateProfile) {
        let itemId = msg.itemId;
        let owner = self.getOwner(itemId);
        require(owner == myAddress(), "Not owner of this profile");
        
        let profile = self.profiles.get(itemId);
        require(profile != null, "Profile not found");
        
        if (msg.username != null) {
            profile.username = msg.username;
        }
        if (msg.xp != null) {
            profile.xp = msg.xp;
        }
        if (msg.level != null) {
            profile.level = msg.level;
        }
        if (msg.badges != null) {
            profile.badges = msg.badges;
        }
        
        self.profiles.set(itemId, profile);
    }
    
    // Get profile data
    get fun getProfile(itemId: Int as uint64): ProfileData? {
        return self.profiles.get(itemId);
    }
}

message UpdateProfile {
    itemId: Int as uint64;
    username: String?;
    xp: Int as uint64?;
    level: Int as uint8?;
    badges: String[]?;
}

