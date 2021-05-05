# FlexRadio Discovery Protocol

From http://wiki.flexradio.com/index.php?title=Discovery_protocol

For all versions after v1.1.3, there will be a new discovery protocol for the radio. The new protocol uses VITA-49 instead of the FlexRadio proprietary format for encapsulation and is sent to the standard VITA-49 port along with all other streaming data (4991). to port 4992 just like the older protocol. The old protocol was designed for one of our first Ethernet based radios, the CDRX-3200, and so we decided to use the same protocol for SmartSDR. The primary issues with the protocol is that it is not name/value pair encoded, it is really field encoded so it makes it difficult to add new fields without causing an issue.

In the new format, it is sent as a VITA-49 extension packet with stream ID 0x800 and a class ID of 0x534CFFFF. The only payload present in the protocol is a string that looks like a status string we emit now so that you can share a parsing mechanism. The string formatter (C) is currently: model=%s serial=%s version=%s name=%s callsign=%s ip=%u.%u.%u.%u port=%u The only deviation from what we've done before is that any spaces in the name field are converted to underscores (_) for this packet so you should convert underscores to spaces for any kind of display. The preamble of the packet is just a standard VITA-49 format. Here is the C struct:

```
typedef struct _vita_ext_data_discovery
{
uint32 header;
uint32 stream_id;
uint32 class_id_h;
uint32 class_id_l;
uint32 timestamp_int;
uint32 timestamp_frac_h;
uint32 timestamp_frac_l;
char	payload[MAX_DISCOVERY_PAYLOAD_SIZE];
} vita_ext_data_discovery, *VitaExtDataDiscovery;
```

And the population is as such (consult the VITA-49 standard):

```
discovery_packet.header = htonl(
VITA_PACKET_TYPE_EXT_DATA_WITH_STREAM_ID |
VITA_HEADER_CLASS_ID_PRESENT |
VITA_TSI_OTHER |
VITA_TSF_SAMPLE_COUNT |
((packet_count++ & 0xF) << 16) |
(packet_len_words & 0xFFFF));
discovery_packet.stream_id = htonl(stream_id);
discovery_packet.class_id_h =  htonl(class_id_h);
discovery_packet.class_id_l =  htonl(class_id_l);
discovery_packet.timestamp_int = 0;
discovery_packet.timestamp_frac_h = 0;
discovery_packet.timestamp_frac_l = 0;
// the copy ensures that we are on a 4-byte boundary per VITA-49 rules
memcpy(discovery_packet.payload, discovery_string, payload_len_bytes + 4);  // copy extra 4 bytes of zeroes to be sure we get to 32-bits
```
