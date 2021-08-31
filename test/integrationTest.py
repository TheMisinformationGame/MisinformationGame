import os
import unittest
import pandas as pd
from selenium import webdriver
from selenium.webdriver.common.keys import Keys


class Test(unittest.TestCase):

    # declare variable to store the url to be visited
    base_url = ""
    # declare variable to store search term
    search_term = ""

    def setUp(self) -> None:

        path = os.getcwd()
        # declare and initialize driver
        self.driver = webdriver.Chrome(os.path.join(path, "chromedriver"))

        # browser loads in maximized window
        self.driver.maximize_window()
        # driver waits implicitly for 10 seconds, for the element under consideration to load
        self.driver.implicitly_wait(10)

    def testSample(self) -> None:

        # load a given url in browser window
        self.driver.get(self.base_url)

        # fetech the content with xpath
        content_list = self.driver.find_elements_by_xpath(
            "//h3/span[contains(text(),'')]/../..//table//td")
        item_list = []

        # collect the result in a dataframe
        df = pd.DataFrame(item_list)

        # find search box
        search_box = self.driver.find_element_by_id("")
        # enter the search term in the search textbox
        search_box.send_keys(self.search_term)

        # to search for the entered search term
        search_box.send_keys(Keys.RETURN)
        # to click on the first search result's link
        self.driver.find_element_by_xpath("").click()
        # switch to the new tab
        self.driver.switch_to.window(self.driver.window_handles[1])
        # to confirm if a certain page has loaded
        self.assertTrue(self.driver.title.startswith(""))
        # to confirm if a certain item is visible or not
        self.assertTrue(self.driver.find_element_by_id("").is_displayed())

    def shutDown(self) -> None:

        self.driver.quit()
