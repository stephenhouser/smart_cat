// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// No Node.js APIs are available in this process because
// `nodeIntegration` is turned off. Use `preload.js` to
// selectively enable features needed in the rendering
// process.

let vita_discovery_port = 4992;

let logarea = document.getElementById('logtext')


const vita_discovery_stream = 0x00000800;
const vita_flex_oui = 0x00001c2d;
const vita_flex_information_class = 0x534cffff;

function showRadios(radios) {
		// 	discovery_protocol_version: "3.0.0.1",
		// 	model: "FLEX-6600M",
		// 	serial: "0621-1104-6601-1641",
		// 	version: "3.2.31.2837",
		// 	nickname: "FlexRadio",
		// 	callsign: "N1SH",
		// 	ip: "192.168.10.27",
		// 	port: "4992",
		// 	status: "Available",
		// 	max_licensed_version: "v3",
		// 	radio_license_id: "00-1C-2D-05-1A-68",
		// 	requires_additional_license: "0",
		// 	fpc_mac: "00:1C:2D:03:85:6A",
		// 	wan_connected: "1",
		// 	licensed_clients: "2",
		// 	available_clients: "2",
		// 	max_panadapters: "4",
		// 	available_panadapters: "4",
		// 	max_slices: "4",
		// 	available_slices: "4",
		// 	gui_client_handles: "\u0000\u0000\u0000",
		//   }
	const radio_list = document.getElementById('radio_list')
	for (key in radios) {
		const radio = radios[key];
		radio_list.innerHTML = '<tr>'
			+ '<td>' + key + '</td>'
			+ '<td>' + radio.model + '</td>'
			+ '<td>' + radio.version + '</td>'
			+ '<td>' + radio.ip + ':' + radio.port + '</td>'
			+ '</tr>';
	}
}

const flex_discover = require('flexradio/Discovery');
const radio_discovery = new flex_discover.Discovery(null, 4992);

const radios = {};

radio_discovery.on('radio', function(radio) {
	console.log('radio!' + radio);

	logarea.value += 'Received: ' + radio.nickname + '\n';

	radios[radio.nickname] = radio;
	showRadios(radios);
})

console.log("starting...");
radio_discovery.Start();

// const { Radio } = require('flexradio/Radio');
// const radio = new Radio({ip:'192.168.10.27', port:4992});
// radio.on('error', function(err) {
// 	console.log(err);
// });
// radio.Connect();