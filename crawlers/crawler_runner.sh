#!/bin/bash

scrape_phrase="karma dla psa brit 15kg"

node $HOME/data-scraper/crawlers/ceneo_scraper.js "$scrape_phrase"
python $HOME/data-scraper/crawlers/olx.py "$scrape_phrase"
