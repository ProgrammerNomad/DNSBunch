#!/usr/bin/env python3
"""
Quick TLD List Scraper
=====================

A lightweight script to quickly extract just the TLD list from IANA
without detailed information. This is useful for getting a quick overview
or for testing purposes.
"""

import requests
import json
import time
import os
from bs4 import BeautifulSoup
from datetime import datetime
import sys

def get_tld_list():
    """
    Quick extraction of TLD list from IANA Root Zone Database
    
    Returns:
        List of TLD dictionaries with basic info
    """
    print("Fetching TLD list from IANA...")
    
    # Set up session
    session = requests.Session()
    session.headers.update({
        'User-Agent': 'Mozilla/5.0 (compatible; TLD-List-Scraper/1.0; Educational Purpose)'
    })
    
    try:
        # Fetch the root database page
        url = "https://www.iana.org/domains/root/db"
        response = session.get(url, timeout=30)
        response.raise_for_status()
        
        soup = BeautifulSoup(response.content, 'html.parser')
        
        # Find the table containing TLD data
        tlds = []
        tables = soup.find_all('table')
        
        for table in tables:
            rows = table.find_all('tr')
            
            for row in rows:
                cells = row.find_all('td')
                if len(cells) >= 3:
                    # Extract TLD information
                    tld_cell = cells[0]
                    tld_link = tld_cell.find('a')
                    
                    if tld_link:
                        tld_name = tld_link.text.strip()
                        tld_url = "https://www.iana.org" + tld_link.get('href', '')
                        
                        # Extract type and manager
                        tld_type = cells[1].text.strip() if len(cells) > 1 else ''
                        manager = cells[2].text.strip() if len(cells) > 2 else ''
                        
                        tld_info = {
                            'tld': tld_name,
                            'type': tld_type,
                            'manager': manager,
                            'detail_url': tld_url
                        }
                        
                        tlds.append(tld_info)
                        print(f"Found: {tld_name} ({tld_type})")
        
        print(f"\nTotal TLDs found: {len(tlds)}")
        return tlds
        
    except Exception as e:
        print(f"Error fetching TLD list: {e}")
        return []

def save_tld_list(tlds, filename=None):
    """Save TLD list to JSON file"""
    if not filename:
        filename = "tld_list.json"
    
    # Create data directory if it doesn't exist
    data_dir = os.path.join(os.path.dirname(__file__), 'data')
    os.makedirs(data_dir, exist_ok=True)
    
    filepath = os.path.join(data_dir, filename)
    
    # Prepare data
    data = {
        'metadata': {
            'total_count': len(tlds),
            'scraped_at': datetime.now().isoformat(),
            'source': 'IANA Root Zone Database',
            'source_url': 'https://www.iana.org/domains/root/db'
        },
        'tlds': tlds,
        'tld_names_only': sorted([tld['tld'] for tld in tlds]),
        'by_type': {}
    }
    
    # Group by type
    for tld in tlds:
        tld_type = tld.get('type', 'unknown')
        if tld_type not in data['by_type']:
            data['by_type'][tld_type] = []
        data['by_type'][tld_type].append(tld['tld'])
    
    # Save to file
    with open(filepath, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    
    print(f"TLD list saved to: {filepath}")
    
    # Print statistics
    print("\nTLD Statistics:")
    for tld_type, tld_list in data['by_type'].items():
        print(f"  {tld_type}: {len(tld_list)}")
    
    return filepath

def main():
    """Main function"""
    print("Quick TLD List Scraper")
    print("======================")
    print("This will quickly fetch the basic TLD list from IANA\n")
    
    # Get TLD list
    tlds = get_tld_list()
    
    if tlds:
        # Save the list
        filepath = save_tld_list(tlds)
        print(f"\nSuccess! TLD list saved to: {filepath}")
        print(f"Total TLDs: {len(tlds)}")
    else:
        print("Failed to fetch TLD list")
        sys.exit(1)

if __name__ == "__main__":
    main()
