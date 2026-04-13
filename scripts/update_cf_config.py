import json
import os

with open('current_config.json', 'r') as f:
    full_config = json.load(f)

config = full_config['DistributionConfig']

# Define the new admin behavior template
def get_admin_behavior(pattern):
    return {
        "PathPattern": pattern,
        "TargetOriginId": "ApiOrigin",
        "TrustedSigners": { "Enabled": False, "Quantity": 0 },
        "TrustedKeyGroups": { "Enabled": False, "Quantity": 0 },
        "ViewerProtocolPolicy": "redirect-to-https",
        "AllowedMethods": {
            "Quantity": 7,
            "Items": ["HEAD", "DELETE", "POST", "GET", "OPTIONS", "PUT", "PATCH"],
            "CachedMethods": { "Quantity": 2, "Items": ["HEAD", "GET"] }
        },
        "SmoothStreaming": False,
        "Compress": False,
        "LambdaFunctionAssociations": { "Quantity": 0 },
        "FunctionAssociations": { "Quantity": 0 },
        "FieldLevelEncryptionId": "",
        "GrpcConfig": { "Enabled": False },
        "ForwardedValues": {
            "QueryString": True,
            "Cookies": { "Forward": "all" },
            "Headers": {
                "Quantity": 3,
                "Items": ["Origin", "Access-Control-Request-Method", "Access-Control-Request-Headers"]
            },
            "QueryStringCacheKeys": { "Quantity": 0 }
        },
        "MinTTL": 0,
        "DefaultTTL": 0,
        "MaxTTL": 0
    }

new_patterns = ["/admin", "/admin/*", "/login", "/logout"]
for pattern in new_patterns:
    # Check if already exists
    if any(item['PathPattern'] == pattern for item in config['CacheBehaviors']['Items']):
        continue
    config['CacheBehaviors']['Items'].append(get_admin_behavior(pattern))

config['CacheBehaviors']['Quantity'] = len(config['CacheBehaviors']['Items'])

with open('updated_config.json', 'w') as f:
    json.dump(config, f, indent=2)

print(f"✅ Updated config prepared with {config['CacheBehaviors']['Quantity']} behaviors.")
