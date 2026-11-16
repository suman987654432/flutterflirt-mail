require ["fileinto", "mailbox"];

# Move messages flagged as spam by Rspamd to Junk folder
if anyof (
    header :contains "X-Spam" "Yes",
    header :contains "X-Spam-Flag" "YES"
) {
    fileinto :create "Junk";
    stop;
}

