/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

global with sharing class FlowImageContentHelper
{
    @InvocableMethod(label='Save Base64 To Content'
                     description='Takes a Base64 String of an Image and saves it to a ContentVersion record'
                     category='Content')
    global static List<ContentResponse> saveBase64ToContent(List<ContentRequest> requests)
    {
        List<ContentResponse> results = new List<ContentResponse>();
        List<ContentVersion> allContents = new List<ContentVersion>();
        for (ContentRequest request : requests)
        {
            ContentVersion cv = new ContentVersion();
            String cleanBase64 = request.base64image.removeStart('data:image/png;base64,');
            cv.VersionData = EncodingUtil.base64Decode(cleanBase64.removeStart('data:image/jpg;base64,'));
            cv.Title = request.fileName;
            cv.PathOnClient = request.fileName;
            allContents.add(cv);
        }
        insert allContents;
        
        for (ContentVersion cv : allContents)
        {
            ContentResponse cr = new ContentResponse();
            cr.contentVersionId = cv.Id;
            results.add(cr);
        }
        
        return results;
    }
    
    global class ContentRequest
    {
        @InvocableVariable(label='Base 64 Image String' required=true)
        global String base64image;
        @InvocableVariable(label='File Name' required=true)
        global String fileName;
    }
    
    global class ContentResponse
    {
		@InvocableVariable(label='ContentVersion Id')
		global Id contentVersionId;
    }
}