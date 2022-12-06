// NFT Viewer for MadSkullz
// Author: @entropy_8_

const base_url = "https://cdn.madskullz.io/madskullz/metadata/";
const NFT_count = 6666;

window.addEventListener("load", function() {
    document.getElementById("token-id").addEventListener("keydown", function(evt) {
        if (evt.keyCode == 13) {
            get_nft_attr();
        }
    });
});

function get_nft_attr() {
    let token_elem = document.getElementById("token-id");
    let token_id = pad_zeros(token_elem.value);
    document.getElementById("skullz-id").innerText = token_id;
    fetch_nft_attr(token_id);
}

function fetch_nft_attr(token_id) {
    
    let url = base_url + token_id + ".json";
    let http_request = new XMLHttpRequest();
    http_request.open("GET", url, true);
    http_request.onreadystatechange = function(){
    if (this.readyState == 4 && this.status == 200) {
        let nft_obj = JSON.parse(this.responseText);
        let ratity_elem = document.getElementById("rarity");
        ratity_elem.classList.remove("rarity-great", "rarity-rare", "rarity-epic", "rarity-legendary", "rarity-forgottenz", "rarity-creatorz");
        ratity_elem.classList.add("rarity-" + nft_obj["rarity"].toLowerCase());
        ratity_elem.innerText = nft_obj["rarity"];

        document.getElementById("rank").innerText = nft_obj["rank"];
        document.getElementById("img").setAttribute("src", nft_obj["image"]);

        let traits_table = document.getElementById("skullz-traits");
        traits_table.innerHTML = "";

        let attr = "";
        nft_obj["attributes"].forEach(function(item, index, array) {
            if (item["trait_type"] === "Rarity") {
                return;
            }

            const trait_type = item["trait_type"];
            const trait_value = item["value"];
            let tr = traits_table.insertRow();
            tr.classList.add("traits-row");

            let td = tr.insertCell();
            td.classList.add("traits-cell");
            td.appendChild(document.createTextNode(trait_type));

            td = tr.insertCell();
            td.classList.add("traits-cell", "right");
            td.appendChild(document.createTextNode(trait_value));

            if (item["rarity"] != undefined) {
                td = tr.insertCell();
                td.classList.add("traits-cell");
                td.classList.add("rarity-" + item["rarity"].toLowerCase());
                td.appendChild(document.createTextNode(item["rarity"]));

                const percentage = (100.0 * SKULLZ_TRAITS[trait_type][trait_value]["count"] / NFT_count).toFixed(2);
                const percentage2 = (100.0 / SKULLZ_TRAITS[trait_type][trait_value]["count"]).toFixed(1);
                td = tr.insertCell();
                td.classList.add("traits-cell", "right");
                td.appendChild(document.createTextNode(`${percentage2}%`));
                td = tr.insertCell();
                td.classList.add("traits-cell", "right");
                td.appendChild(document.createTextNode(`${percentage}%`));
            }

        });
    }
    };
    http_request.send();
}

function pad_zeros(token_id) {
    return ('0000' + token_id).slice(-4);
}
