#!/bin/bash

scrape_phrase="karma dla psa brit 15kg"

node /home/jakubg/data-scraper/crawlers/ceneo_scraper.js "$scrape_phrase"
python /home/jakubg/data-scraper/crawlers/olx.py "$scrape_phrase"
