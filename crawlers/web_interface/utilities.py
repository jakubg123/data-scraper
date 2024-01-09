import subprocess
def run_script(search_phrase):
    path_to_script = '/home/jakubg/data-scraper/crawlers/ceneo_crawler/ceneo_scraper.js'
    subprocess.run(['node', path_to_script, search_phrase])