import sys
import struct


class GlobalHeader:
    version_major = None
    magic_number = None
    version_minor = None
    thiszone = None
    sigfigs = None
    network= None
    snaplen= None

    def __init__(self, buffer):
        self.magic_number, self.version_minor, self.version_major, self.sigfigs, self.thiszone, self.snaplen, self.network = struct.unpack('IHHiIII', buffer)




class PacketHeader:         #attributes for packetheader
    ts_sec = None
    ts_usec = None
    incl_len = None
    orig_len = None
    def __init__(self):
        self.ts_sec = 0
        self.ts_usec = 0
        self.incl_len = 0
        self.orig_len = 0

    def set_header(self, buffer):
        self.ts_sec, self.ts_usec, self.incl_len, self.orig_len = struct.unpack('IIII', buffer)


class ICMPheader():
    code = None
    src_port =None
    dst_port = None
    sequence = None
    num = None

    def set_type(self, buffer):
        res = struct.unpack('B', buffer)[0]
        self.num= int(res)

    def set_code(self, buffer):
        res = struct.unpack('B', buffer)[0]
        self.code= int(res)

    def set_src_port(self, buffer):
        res = struct.unpack('BB', buffer)
        self.src_port=  int(str(hex(res[0])) + str(hex(res[1]))[2:], 16)

    def set_dst_port(self, buffer):
        res = struct.unpack('BB', buffer)
        self.dst_port=  int(str(hex(res[0])) + str(hex(res[1]))[2:], 16)

    def set_sequence(self, buffer):
        res = struct.unpack('BB', buffer)
        self.sequence=  int(str(hex(res[0])) + str(hex(res[1]))[2:], 16)


class UDPheader():
    udp_len= None
    src_port =None
    dst_port = None
    checksum = None


    def set_udp_len(self, buffer):
        res = struct.unpack('BB', buffer)
        self.udp_len=  int(str(hex(res[0])) + str(hex(res[1]))[2:], 16)

    def set_src_port(self, buffer):
        res = struct.unpack('BB', buffer)
        self.src_port=  int(str(hex(res[0])) + str(hex(res[1]))[2:], 16)

    def set_dst_port(self, buffer):
        res = struct.unpack('BB', buffer)
        self.dst_port=  int(str(hex(res[0])) + str(hex(res[1]))[2:], 16)


    def set_checksum(self, buffer):
        res = struct.unpack('BB', buffer)
        self.src_checksum=  str(hex(res[0])) + str(hex(res[1]))


class IPHeader:
    src_ip = None
    dst_ip = None
    ip_header_len = None
    total_len = None
    identification = None
    fragment_offset = None
    ttl = None
    protocol = None
    flags = None

    def __init__(self):
        self.src_ip = None
        self.dst_ip = None
        self.ip_header_len = 0
        self.total_len = 0


    def header_len_set(self,length):
        res = struct.unpack('B', length)[0]
        self.ip_header_len = (res & 15)*4


    def total_len_set(self, buffer):
        num1 = ((buffer[0] & 240) >> 4) * 16 * 16 * 16
        num2 = (buffer[0] & 15) * 16 * 16
        num3 = ((buffer[1] & 240) >> 4) * 16
        num4 = (buffer[1] & 15)
        self.total_length = num1 + num2 + num3 + num4

    def set_IP(self,buffer1,buffer2):
        src_addr = struct.unpack('BBBB',buffer1)
        dst_addr = struct.unpack('BBBB',buffer2)
        self.src_ip = f"{src_addr[0]}.{src_addr[1]}.{src_addr[2]}.{src_addr[3]}"
        self.dst_ip = f"{dst_addr[0]}.{dst_addr[1]}.{dst_addr[2]}.{dst_addr[3]}"
    def set_identification(self, buffer):
        res = struct.unpack('BB', buffer)
        self.identification = int(str(hex(res[0]))+ str(hex(res[1]))[2:], 16)

    def set_frag_offset(self, buffer):
        num0 = hex(((buffer[0] & 224) >> 5))
        num1 = ((buffer[0] & 16) >> 4) * 16 * 16 * 16
        num2 = (buffer[0] & 15) * 16 * 16
        num3 = ((buffer[1] & 240) >> 4) * 16
        num4 = (buffer[1] & 15)
        self.flags = num0
        self.fragment_offset = (num1 + num2 + num3 + num4) * 8

    def set_ttl(self, buffer):
        self.ttl = struct.unpack('B', buffer)[0]

    def set_protocol(self, buffer):
        self.protocol = struct.unpack('B', buffer)[0]


class packet():

    header= None
    tcp = None
    ip = None
    data = None
    timestamp = None
    payload = None
    udp= None

    def __init__(self):
        self.udp = UDPheader()
        self.icmp = ICMPheader()
        self.header = PacketHeader()

        self.ip = IPHeader()
        self.data= b''
        self.timestamp = 0
        self.payload =0

    def timestamp_set(self,orig_time):
        secs = self.header.ts_sec
        microsecs = self.header.ts_usec
        self.timestamp= round(secs+microsecs * 0.000001-orig_time, 6)

#buffer1: the bytes object for ts_sec
#buffer2: the bytes object for ts_usec
#orig_time: the start time of the first packet

    def set_header(self, buffer):
        self.header.set_header(buffer)

    def set_data(self, buffer):
        self.data = buffer

    def set_number(self, value):
        self.packet_number = value

    def set_rtt(self, p):
        rtt = p.timestamp - self.timestamp  # Calculate RTT
        self.RTT_value = round(rtt, 8)

    def set_ip(self):
        offset = 14
        self.ip.header_len_set(self.data[offset+ 0: offset+1])
        self.ip.total_len_set(self.data[offset+ 2: offset+4])
        self.ip.set_identification(self.data[offset+ 4: offset+6])
        self.ip.set_frag_offset(self.data[offset + 6: offset+8])
        self.ip.set_ttl(self.data[offset+ 8: offset+9])
        self.ip.set_protocol(self.data[offset+ 9: offset+10])
        self.ip.set_IP(self.data[offset+ 12: offset+16], self.data[offset+16: offset+20])
    def set_udp(self):
        offset = 14+self.ip.ip_header_len
        self.udp.set_dst_port(self.data[offset+ 2: offset+4])
        self.udp.set_src_port(self.data[offset+ 0: offset+2])
        self.udp.set_udp_len(self.data[offset+ 4: offset+6])
        self.udp.set_checksum(self.data[offset+ 6: offset+8])

    def set_icmp(self):
        offset = 14+self.ip.ip_header_len
        self.icmp.set_type(self.data[offset+0: offset+1])
        self.icmp.set_code(self.data[offset+1: offset+2])
        if self.icmp.num ==8 or self.icmp.num ==0:
            self.icmp.set_sequence(self.data[offset+6: offset+8])

        offset += 8 + self.ip.ip_header_len
        if offset+4 <= self.header.incl_len:
            if self.icmp.num != 8 and self.icmp.num != 0:
                self.icmp.set_sequence(self.data[offset+6: offset+8]) # also windows
            self.icmp.set_src_port(self.data[offset+0: offset+2])
            self.icmp.set_dst_port(self.data[offset+2: offset+4])
        else:
            self.icmp.src_port = 0
            self.icmp.dst_port = 0


    def set_payload(self, payload):
        self.payload = payload


#main execution

if len(sys.argv) != 2:
    print("Invalid input, Usage: python 3 P3_Fall2024.py <example_file_cap>")
    exit()

input = sys.argv[1]
f=  open(input, 'rb')       #open file

global_header = GlobalHeader(f.read(24))
dst = []
src = []
start_time_pcap = None
count=0
#Protocol maps
protocol_used = {}
pmap = {1: 'ICMP', 17: 'UDP'}

while True:
    count +=1
    s= f.read(16)
    if s == b'':
        break

    pkt = packet()
    pkt.set_header(s)
    pkt.set_number(count)
    incl_len = pkt.header.incl_len      #get length

    if start_time_pcap is None:     #record start time
        secs = pkt.header.ts_sec
        microsecs = pkt.header.ts_usec
        start_time_pcap = round(secs+ microsecs * 0.000001, 6)

    pkt.set_data(f.read(incl_len))
    pkt.set_ip()

    if pkt.ip.protocol==1:
        pkt.set_icmp()
        dst.append(pkt)
        protocol_used[1] = 'ICMP'

    if pkt.ip.protocol==17:
        pkt.set_udp()
        src.append(pkt)
        if not 33434 <= pkt.udp.dst_port <= 33529:
            continue
        protocol_used[17] = 'UDP'

    if pkt.ip.protocol not in pmap:
        continue

#for windows
if any(i.icmp.num == 8 for i in dst):
    j = dst
    dst=[]
    src=[]

    for i in j:
        if i.icmp.num ==8:
            src.append(i)
        if i.icmp.num ==11 or i.icmp.num==0:
            dst.append(i)
    inter =[]
    inter_pkt = []
    rtt = {}
    for k in src:
        for l in dst:
            if k.icmp.sequence == l.icmp.sequence:
                if l.ip.src_ip not in inter:
                    inter.append(l.ip.src_ip)
                    inter_pkt.append(l)
                    rtt[l.ip.src_ip] = []

                k.timestamp_set(start_time_pcap)
                l.timestamp_set(start_time_pcap)
                rtt[l.ip.src_ip].append(l.timestamp-k.timestamp)


#on linux
else:
    inter = []
    inter_pkt=[]
    rtt={}
    for k in src:
        for l in dst:
            if k.udp.src_port == l.icmp.src_port:
                if l.ip.src_ip not in inter:
                    inter.append(l.ip.src_ip)
                    inter_pkt.append(l)
                    rtt[l.ip.src_ip] = []

                k.timestamp_set(start_time_pcap)
                l.timestamp_set(start_time_pcap)
                rtt[l.ip.src_ip].append(l.timestamp-k.timestamp)


dic= {}

for pkt in src:
    if pkt.ip.identification not in dic:
        dic[pkt.ip.identification] = []

    dic[pkt.ip.identification].append(pkt)

counter = 0
for identity in dic:
    if len(dic[identity]) > 1:
        counter +=1


# Print header for the table
print("=" * 90)

# Row 1: The IP address of the source node
print(f"{'1':<5} {'The IP address of the source node (R1)':<60} {src[0].ip.src_ip}")
print("-" * 90)

# Row 2: The IP address of the ultimate destination node
print(f"{'2':<5} {'The IP address of ultimate destination node (R1)':<60} {src[0].ip.dst_ip}")
print("-" * 90)

# Row 3: The IP addresses of the intermediate destination nodes
intermediate_ips = ", ".join(inter[:-1]) if len(inter) > 1 else "None"
print(f"{'3':<5} {'The IP addresses of the intermediate destination nodes (R1)':<60} {intermediate_ips}")
print("-" * 90)

#Row 4: The correct order of the intermediate destination nodes
print(f"{'4':<5} {'The correct order of the intermediate destination nodes (R1)':<60} {intermediate_ips}")
print("-" * 90)

# Row 5: The values in the protocol field of IP headers
protocol_details = ", ".join(f"{protocol}: {protocol_used[protocol]}" for protocol in sorted(protocol_used))
print(f"{'5':<5} {'The values in the protocol field of IP headers (R1)':<60} {protocol_details}")
print("-" * 90)

# Row 6 and 7: The number of fragments and the offset of the last fragment
if counter == 0:
    print(f"{'6':<5} {'The number of fragments created from the original datagram (R1)':<60} 0")
    print(f"{'7':<5} {'The offset of the last fragment (R1)':<60} 0")
else:
    for identity in dic:
        if len(dic[identity]) > 1:
            print(f"{'6':<5} {'The number of fragments created from the original datagram (R1)':<60} {len(dic[identity])}")
            offset = max(packet.ip.fragment_offset for pkt in dic[identity])
            print(f"{'7':<5} {'The offset of the last fragment (R1)':<60} {offset}")
print("-" * 90)

# Row 8 and 9: RTT avg and std deviation for each intermediate node
for a in range(len(inter)):
    avg = round(sum(rtt[inter[a]]) / len(rtt[inter[a]]), 6)
    std = round((sum(pow(x - avg, 2) for x in rtt[inter[a]]) / len(rtt[inter[a]]))**(1/2), 6)
    if a == len(inter) - 1:  # For ultimate destination node
        print(f"{'8':<5} {'The avg RTT to ultimate destination node (R1)':<60} {avg} ms")
        print(f"{'9':<5} {'The std deviation of RTT to ultimate destination node (R1)':<60} {std} ms")
    else:  # For intermediate nodes
        print(f"{'8':<5} {'The avg RTT to intermediate node ' + inter[a] + ' (R1)':<60} {avg} ms")
        print(f"{'9':<5} {'The std deviation of RTT to intermediate node ' + inter[a] + ' (R1)':<60} {std} ms")
print("-" * 90)

# Row 10: The number of probes per TTL
ttl_dict = {}
for p in src:
    if p.ip.ttl not in ttl_dict:
        ttl_dict[p.ip.ttl] = []
    ttl_dict[p.ip.ttl].append(p)
ttl_probes = ", ".join(f"TTL {ttl}: {len(ttl_dict[ttl])}" for ttl in sorted(ttl_dict))
print(f"{'10':<5} {'The number of probes per TTL (R2)':<60} {ttl_probes}")
print("-" * 90)
