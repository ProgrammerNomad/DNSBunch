#!/usr/bin/env python3
"""
Detailed TLD Scraper
Scrapes comprehensive TLD information from IANA and saves with TLD name as key for fast access.

Usage:
    python detailed_tld_scraper.py           # Process all TLDs
    python detailed_tld_scraper.py 10        # Process only first 10 TLDs
    python detailed_tld_scraper.py 50        # Process only first 50 TLDs
"""

import requests
from bs4 import BeautifulSoup
import json
import time
import re
import sys
from urllib.parse import urljoin

def load_tld_list():
    """Load the TLD list from tld_list.json"""
    try:
        with open('data/tld_list.json', 'r', encoding='utf-8') as f:
            data = json.load(f)
            return data.get('tlds', [])
    except FileNotFoundError:
        print("Error: tld_list.json not found. Please run quick_tld_scraper.py first.")
        return []

def extract_section_data(soup, section_name):
    """Extract structured data from a section (Sponsoring Organisation, Administrative Contact, etc.)"""
    # Find the h2 heading
    heading = soup.find('h2', string=re.compile(section_name, re.IGNORECASE))
    if not heading:
        return {}
    
    data = {}
    all_text = ""
    
    # Get all content until next h2
    current = heading.next_sibling
    while current and (not hasattr(current, 'name') or current.name != 'h2'):
        if hasattr(current, 'name'):
            if current.name == 'b':
                # Bold text - usually name/label
                text = current.get_text(strip=True)
                if text and not text.endswith(':'):
                    all_text += f"NAME:{text}\n"
            elif current.name == 'br':
                all_text += "\n"
            elif current.name in ['p', 'div']:
                text = current.get_text(strip=True)
                if text:
                    all_text += text + "\n"
        elif isinstance(current, str):
            text = current.strip()
            if text:
                all_text += text + "\n"
        
        current = current.next_sibling
    
    # Parse the collected text
    lines = [line.strip() for line in all_text.split('\n') if line.strip()]
    
    name = ""
    organisation = ""
    address_lines = []
    
    for line in lines:
        if line.startswith('NAME:'):
            name = line.replace('NAME:', '').strip()
        elif 'Email:' in line:
            email_match = re.search(r'Email:\s*([^\s]+@[^\s]+)', line)
            if email_match:
                data['e-mail'] = email_match.group(1)
        elif 'Voice:' in line:
            voice_match = re.search(r'Voice:\s*([+\d\s\-\(\)]+)', line)
            if voice_match:
                data['phone'] = voice_match.group(1).strip()
        elif 'Fax:' in line:
            fax_match = re.search(r'Fax:\s*([+\d\s\-\(\)]+)', line)
            if fax_match:
                data['fax-no'] = fax_match.group(1).strip()
        else:
            # Check if it's address-like or organization
            if any(char.isdigit() for char in line) or 'way' in line.lower() or 'drive' in line.lower():
                address_lines.append(line)
            elif not organisation and name and line != name and len(line.split()) <= 6:
                organisation = line
            elif 'united states' in line.lower() or 'america' in line.lower():
                data['country'] = line
    
    # Set the extracted data
    if name:
        data['name'] = name
    if organisation:
        data['organisation'] = organisation
    elif name:  # If no separate org found, use name as org
        data['organisation'] = name
    
    # Set address
    if address_lines:
        # Try to parse the address lines
        full_address = address_lines[0] if address_lines else ""
        city_state = ""
        state = ""
        
        # Look for the city/state line (usually second address line)
        if len(address_lines) > 1:
            city_state_line = address_lines[1]
            # Pattern: "City ST 12345"
            match = re.match(r'(.+?)\s+([A-Z]{2})\s+\d+', city_state_line)
            if match:
                city_state = match.group(1).strip()
                state = match.group(2)
            else:
                city_state = city_state_line
        
        data['address'] = {
            'city': full_address + (" " + city_state if city_state else ""),
            'state': state,
            'country': data.get('country', '')
        }
    
    return data

def parse_contact_info(contact_text):
    """Parse contact information into structured format"""
    if not contact_text:
        return {}
    
    contact = {}
    lines = [line.strip() for line in contact_text.split('\n') if line.strip()]
    
    if not lines:
        return {}
    
    # Extract name (usually first bold text)
    contact['name'] = lines[0] if lines else ""
    
    # Find organization (usually second line if different from name)
    if len(lines) > 1 and lines[1] != lines[0]:
        contact['organisation'] = lines[1]
    else:
        contact['organisation'] = lines[0] if lines else ""
    
    # Extract address components
    address_lines = []
    city, state, country = "", "", ""
    
    for line in lines[1:]:  # Skip the name/org lines
        # Skip email, phone, fax lines
        if any(keyword in line.lower() for keyword in ['email:', 'voice:', 'fax:', '@']):
            continue
            
        # Check if it's an address line
        if any(char.isdigit() for char in line) or 'way' in line.lower() or 'street' in line.lower():
            address_lines.append(line)
        elif len(line.split()) <= 4 and not line.startswith('+'):  # Likely city/state/country
            if not city:
                city = line
            elif not state and len(line) <= 10:  # State codes are usually short
                state = line
            elif not country:
                country = line
    
    # Set address
    if address_lines or city or state or country:
        contact['address'] = {
            'city': ' '.join(address_lines + [city]).strip(),
            'state': state,
            'country': country
        }
    
    # Extract phone, fax, email from the original text
    full_text = contact_text
    
    # Extract phone
    phone_match = re.search(r'Voice:\s*([+\d\s\-\(\)]+)', full_text, re.IGNORECASE)
    if phone_match:
        contact['phone'] = phone_match.group(1).strip()
    
    # Extract fax
    fax_match = re.search(r'Fax:\s*([+\d\s\-\(\)]+)', full_text, re.IGNORECASE)
    if fax_match:
        contact['fax-no'] = fax_match.group(1).strip()
    
    # Extract email
    email_match = re.search(r'Email:\s*([^\s\n]+@[^\s\n]+)', full_text, re.IGNORECASE)
    if email_match:
        contact['e-mail'] = email_match.group(1).strip()
    
    return contact

def parse_name_servers(soup):
    """Extract name servers with their IP addresses"""
    name_servers = []
    
    # Look for name server section - it's in a table
    table = soup.find('table', class_='iana-table')
    if not table:
        return name_servers
    
    # Find all rows in the table body
    tbody = table.find('tbody')
    if not tbody:
        return name_servers
        
    rows = tbody.find_all('tr')
    for row in rows:
        cells = row.find_all('td')
        if len(cells) >= 2:
            hostname = cells[0].get_text(strip=True)
            ip_cell = cells[1]
            
            # Parse IPv4 and IPv6 from the IP cell
            ipv4 = ""
            ipv6 = ""
            
            # Get all text from the IP cell
            ip_texts = []
            for content in ip_cell.contents:
                if hasattr(content, 'get_text'):
                    text = content.get_text(strip=True)
                    if text:
                        ip_texts.append(text)
                elif isinstance(content, str):
                    text = content.strip()
                    if text:
                        ip_texts.append(text)
            
            # Process each IP text
            for ip_text in ip_texts:
                ip_text = ip_text.strip()
                # IPv4 pattern: xxx.xxx.xxx.xxx
                if re.match(r'^\d+\.\d+\.\d+\.\d+$', ip_text):
                    ipv4 = ip_text
                # IPv6 pattern: contains colons and is longer
                elif ':' in ip_text and len(ip_text) > 7:
                    # Clean up IPv6 (remove any trailing text)
                    ipv6_match = re.match(r'([0-9a-fA-F:]+)', ip_text)
                    if ipv6_match:
                        ipv6 = ipv6_match.group(1)
            
            if hostname:  # Only add if hostname exists
                name_servers.append({
                    'hostname': hostname,
                    'ipv6': ipv6,
                    'ipv4': ipv4
                })
    
    return name_servers

def scrape_tld_details(tld_data):
    """Scrape detailed information for a single TLD"""
    detail_url = tld_data.get('detail_url', '')
    if not detail_url:
        return None
    
    try:
        response = requests.get(detail_url, timeout=30)
        response.raise_for_status()
        
        # Parse using regex for more reliable extraction
        text = response.text
        
        # Extract sponsoring organization
        org_info = extract_section_from_text(text, 'Sponsoring Organisation')
        
        # Extract administrative contact
        admin_info = extract_section_from_text(text, 'Administrative Contact')
        
        # Extract technical contact
        tech_info = extract_section_from_text(text, 'Technical Contact')
        
        # Parse name servers from HTML table
        soup = BeautifulSoup(response.content, 'html.parser')
        name_servers = parse_name_servers(soup)
        
        # Extract WHOIS server - check multiple locations
        whois = ""
        
        # First try: Direct WHOIS Server field
        whois_match = re.search(r'WHOIS Server:\s*([^\s\n<]+)', text, re.IGNORECASE)
        if whois_match:
            whois = whois_match.group(1).strip()
        else:
            # Second try: In Registry Information section
            reg_section = re.search(r'Registry Information(.*?)(?=<h2>|Record last updated)', text, re.DOTALL | re.IGNORECASE)
            if reg_section:
                reg_text = reg_section.group(1)
                whois_match = re.search(r'WHOIS Server:\s*([^\s\n<]+)', reg_text, re.IGNORECASE)
                if whois_match:
                    whois = whois_match.group(1).strip()
                else:
                    # Third try: Look for whois.domain pattern
                    whois_match = re.search(r'whois\.([a-zA-Z0-9.-]+\.[a-zA-Z]{2,})', reg_text, re.IGNORECASE)
                    if whois_match:
                        whois = f"whois.{whois_match.group(1)}"
        
        # Extract registration information
        registration_text = ""
        reg_match = re.search(r'Registration information[^:]*:\s*([^\n<]+)', text, re.IGNORECASE)
        if reg_match:
            registration_text = reg_match.group(1).strip()
        else:
            # Try to get URL for registration services
            url_match = re.search(r'URL for registration services:\s*([^\s\n<]+)', text, re.IGNORECASE)
            if url_match:
                registration_text = url_match.group(1).strip()
        
        # Check if this TLD has sufficient information to continue
        has_sufficient_info = bool(org_info.get('name') or admin_info.get('name') or tech_info.get('name') or name_servers)
        
        if not has_sufficient_info:
            print(f"  Skipping {tld_data['tld']} - insufficient information available")
            return None
        
        # Look for dates
        created = ""
        changed = ""
        
        # Registration date
        reg_date_match = re.search(r'Registration date\s+(\d{4}-\d{2}-\d{2})', text)
        if reg_date_match:
            created = reg_date_match.group(1)
        
        # Last updated
        updated_match = re.search(r'Record last updated\s+(\d{4}-\d{2}-\d{2})', text)
        if updated_match:
            changed = updated_match.group(1)
        
        # Build the detailed record
        detailed_record = {
            'tld': tld_data['tld'].lstrip('.'),  # Remove the dot for consistency
            'organisation': org_info,
            'administrative': admin_info,
            'technical': tech_info,
            'nserver': name_servers,
            'whois': whois,
            'status': 'active',
            'remarks': registration_text,
            'created': created,
            'changed': changed,
            'source': 'iana'
        }
        
        return detailed_record
        
    except Exception as e:
        print(f"Error scraping {tld_data['tld']}: {str(e)}")
        return None

def extract_section_from_text(text, section_name):
    """Extract section data using regex parsing of the full text"""
    # Find the section heading
    pattern = rf'<h2>\s*{re.escape(section_name)}\s*</h2>(.*?)(?=<h2>|$)'
    match = re.search(pattern, text, re.DOTALL | re.IGNORECASE)
    
    if not match:
        return {}
    
    section_html = match.group(1)
    
    # Extract information from the section
    data = {}
    
    # Extract name (first <b> tag content)
    name_match = re.search(r'<b>\s*([^<]+?)\s*</b>', section_html)
    if name_match:
        data['name'] = name_match.group(1).strip()
    
    # Extract all text content and preserve line breaks properly
    # First replace <br> with a special marker
    clean_text = re.sub(r'<br\s*/?>', '|||LINEBREAK|||', section_html)
    # Remove all other HTML tags
    clean_text = re.sub(r'<[^>]+>', '', clean_text)
    # Convert markers back to newlines
    clean_text = clean_text.replace('|||LINEBREAK|||', '\n')
    # Clean up extra whitespace but preserve line structure
    lines = []
    for line in clean_text.split('\n'):
        line = re.sub(r'\s+', ' ', line.strip())
        if line:
            lines.append(line)
    clean_text = '\n'.join(lines)
    
    # Extract email
    email_match = re.search(r'Email:\s*([^\s]+@[^\s]+)', clean_text, re.IGNORECASE)
    if email_match:
        data['e-mail'] = email_match.group(1)
    
    # Extract phone (improved pattern)
    phone_match = re.search(r'Voice:\s*([+\d\s\-\(\)]+?)(?:\s*(?:Fax|Technical|Administrative|Name|$))', clean_text, re.IGNORECASE)
    if phone_match:
        data['phone'] = phone_match.group(1).strip()
    
    # Extract fax (improved pattern)
    fax_match = re.search(r'Fax:\s*([+\d\s\-\(\)]+?)(?:\s*(?:Technical|Administrative|Name|$))', clean_text, re.IGNORECASE)
    if fax_match:
        data['fax-no'] = fax_match.group(1).strip()
    
    # Extract organization and address with better parsing
    lines = [line.strip() for line in clean_text.split('\n') if line.strip()]
    
    organisation = ""
    address_lines = []
    city = ""
    state = ""
    country = ""
    
    # Remove email/phone/fax/contact lines from processing
    filtered_lines = []
    for line in lines:
        if any(keyword in line.lower() for keyword in ['email:', 'voice:', 'fax:', 'technical contact', 'administrative contact']):
            continue
        if data.get('name') and line == data['name']:
            continue
        filtered_lines.append(line)
    
    # Parse the filtered lines
    for i, line in enumerate(filtered_lines):
        # Check if it's a street address (contains numbers + address keywords)
        if (re.search(r'\d+', line) and 
            any(word in line.lower() for word in ['way', 'drive', 'street', 'avenue', 'road', 'blvd', 'boulevard', 'aaa'])):
            address_lines.append(line)
        # Check if it's city/state/zip pattern (e.g., "Heathrow FL 32746")
        elif re.match(r'^[A-Za-z\s]+\s+[A-Z]{2}\s+\d{5}', line):
            parts = line.split()
            if len(parts) >= 3:
                state = parts[-2] if len(parts[-2]) == 2 else ""
                city = " ".join(parts[:-2]) if state else " ".join(parts[:-1])
        # Check if it's a country line
        elif any(country_word in line.lower() for country_word in ['united states', 'america', 'canada', 'kingdom', 'germany', 'france']):
            country = line
        # Otherwise, might be organization (if not too long and first non-address line)
        elif not organisation and len(line.split()) <= 6 and not any(char.isdigit() for char in line):
            organisation = line
    
    # Set organization
    if organisation:
        data['organisation'] = organisation
    elif data.get('name'):
        data['organisation'] = data['name']
    
    # Set address with proper structure
    if address_lines or city or state or country:
        data['address'] = {
            'city': " ".join(address_lines) + (" " + city if city else ""),
            'state': state,
            'country': country
        }
    
    return data

def main():
    """Main function to scrape all TLD details"""
    # Check command line arguments
    limit = None
    if len(sys.argv) > 1:
        try:
            limit = int(sys.argv[1])
            print(f"Processing only first {limit} TLDs")
        except ValueError:
            print("Error: Please provide a valid number for limit")
            print("Usage: python detailed_tld_scraper.py [number_of_tlds]")
            return
    
    print("Loading TLD list...")
    tlds = load_tld_list()
    
    if not tlds:
        print("No TLDs found. Exiting.")
        return
    
    # Apply limit if specified
    if limit:
        tlds = tlds[:limit]
        print(f"Limited to first {len(tlds)} TLDs")
    else:
        print(f"Processing all {len(tlds)} TLDs")
    
    detailed_tlds = {}
    processed = 0
    errors = 0
    
    for i, tld in enumerate(tlds):
        print(f"Processing {tld['tld']} ({i+1}/{len(tlds)})")
        
        detailed_data = scrape_tld_details(tld)
        if detailed_data:
            # Use TLD name as key for fast access (remove the dot)
            tld_key = tld['tld'].lstrip('.')
            detailed_tlds[tld_key] = detailed_data
            processed += 1
        else:
            errors += 1
            print(f"  Failed to process {tld['tld']}")
        
        # Save progress every 50 TLDs (or at the end if fewer than 50)
        if (i + 1) % 50 == 0 or (i + 1) == len(tlds):
            with open('data/detailed_tlds.json', 'w', encoding='utf-8') as f:
                json.dump(detailed_tlds, f, indent=2, ensure_ascii=False)
            print(f"Progress saved: {processed} successful, {errors} errors")
        
        # Respectful delay
        time.sleep(1)
    
    # Final save
    with open('data/detailed_tlds.json', 'w', encoding='utf-8') as f:
        json.dump(detailed_tlds, f, indent=2, ensure_ascii=False)
    
    print(f"\nCompleted! Processed {processed} TLDs successfully, {errors} errors")
    print(f"Results saved to data/detailed_tlds.json")
    if limit:
        print(f"Note: Only processed first {limit} TLDs as requested")

if __name__ == "__main__":
    main()
